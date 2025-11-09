#!/usr/bin/env python3
"""
Generate new data structure for politigraph webapp
Transforms GraphQL data into 4 JSON files: person_data, person_vote_data, fact_data, vote_detail_data
"""

import requests
import time
import pandas as pd
import json
import sys
from pathlib import Path

# Configuration
GRAPHQL_URL = 'https://politigraph.wevis.info/graphql'
HEADERS = {"Content-Type": "application/json"}
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "data" / "new-data"
BATCH_SIZE = 100
MAX_EMPTY_LOOPS = 2
SLEEP_SEC = 1

def run_gql(query, variables):
    """Execute GraphQL query"""
    try:
        r = requests.post(GRAPHQL_URL, headers=HEADERS, json={"query": query, "variables": variables})
        r.raise_for_status()
        payload = r.json()
        if "error" in payload:
            raise RuntimeError(payload["error"])
        return payload["data"]
    except Exception as e:
        print(f"GraphQL error: {e}")
        raise

def fetch_with_pagination(query, data_key, batch_size=BATCH_SIZE, max_empty_loops=MAX_EMPTY_LOOPS, sleep_sec=SLEEP_SEC):
    """Generic pagination fetcher"""
    seen_ids = set()
    all_rows = []
    offset = 0
    stalled = 0

    while True:
        data = run_gql(query, {"limit": batch_size, "offset": offset})
        page = data[data_key] or []
        page_size = len(page)

        print(f"  offset={offset} fetched={page_size}")
        if page_size == 0:
            print("  No more data.")
            break

        new_rows = [row for row in page if row.get("id") not in seen_ids]
        for row in new_rows:
            seen_ids.add(row["id"])
        all_rows.extend(new_rows)

        print(f"  added={len(new_rows)} total={len(all_rows)}")

        if len(new_rows) == 0:
            stalled += 1
            if stalled >= max_empty_loops:
                print("  Stalled pagination. Stopping.")
                break
        else:
            stalled = 0

        if page_size < batch_size:
            print("  Likely last page.")
            break

        offset += batch_size
        time.sleep(sleep_sec)
    
    return all_rows

def fetch_people():
    """Fetch all people data from GraphQL API"""
    print("\n1. Fetching people data...")
    query = """
    query People($limit: Int, $offset: Int) {
      people(limit: $limit, offset: $offset) {
        id
        prefix
        name
        image
        gender
        national_identity
        birth_date
        educations
        previous_occupations
        memberships {
          label
          province
          district_number
          start_date
          end_date
          posts {
            label
            start_date
            end_date
            organizations{
              name
              image
              color
            }
          }
        }
      }
    }
    """
    return fetch_with_pagination(query, "people")

def fetch_vote_events():
    """Fetch all vote events from GraphQL API"""
    print("\n2. Fetching vote events...")
    query = """
    query VoteEvents($limit: Int, $offset: Int) {
      voteEvents(limit: $limit, offset: $offset) {
        id
        title
        nickname
        classification
        publish_status
        start_date
        end_date
        pass_condition
        result
        agree_count
        disagree_count
        abstain_count
        novote_count
        votes {
          option
          voters {
            name
          }
        }
      }
    }
    """
    return fetch_with_pagination(query, "voteEvents")

def transform_person_data(people):
    """Transform people data to person dimension table"""
    print("\n3. Transforming person data...")
    
    # Normalize posts
    df_posts = pd.json_normalize(
        data=people,
        record_path=["memberships", "posts"],
        meta=[
            ["memberships", "label"],
            ["memberships", "province"],
            ["memberships", "district_number"],
            ["memberships", "start_date"],
            ["memberships", "end_date"],
            "prefix", "name", "gender", "image", "national_identity", "birth_date", "educations", "previous_occupations"
        ],
        sep="__",
        record_prefix="post__",
        meta_prefix="m_or_person__"
    ).rename(columns={
        "m_or_person__memberships__label": "m__label",
        "m_or_person__memberships__province": "m__province",
        "m_or_person__memberships__district_number": "m__district_number",
        "m_or_person__memberships__start_date": "m__start_date",
        "m_or_person__memberships__end_date": "m__end_date",
        "m_or_person__prefix": "person__prefix",
        "m_or_person__name": "person__name",
        "m_or_person__gender": "person__gender",
        "m_or_person__national_identity": "person__national_identity",
        "m_or_person__birth_date": "person__birth_date",
        "m_or_person__educations": "person__educations",
        "m_or_person__previous_occupations": "person__previous_occupations",
        "m_or_person__image": "person__image"
    })

    # Explode organizations
    df_post_orgs = df_posts.explode("post__organizations", ignore_index=True)
    org_cols = pd.json_normalize(df_post_orgs["post__organizations"]).add_prefix("org__")
    df_post_orgs = pd.concat(
        [df_post_orgs.drop(columns=["post__organizations"]), org_cols],
        axis=1
    )

    # Filter for current representatives (แบ่งเขต)
    fil_rep = df_post_orgs[(df_post_orgs["post__label"].str.contains("สส. ชุดที่", case=False, na=False)) & (df_post_orgs["post__label"].str.len() == 13)]["post__label"].unique().max()
    df_rep = df_post_orgs[(df_post_orgs["post__label"] == fil_rep) & (df_post_orgs["m__label"] == "แบ่งเขต") & df_post_orgs["m__end_date"].isna()]

    # Get party information
    df_prep_party = df_post_orgs[(df_post_orgs["post__label"].str.contains("สมาชิกพรรค", case=False, na=False)) & (df_post_orgs["m__end_date"].isna())][["person__name", "post__label", "org__name", "org__image", "org__color", "m__start_date"]].drop_duplicates()
    df_party = df_prep_party[df_prep_party["m__start_date"] == df_prep_party.groupby("person__name")["m__start_date"].transform("max")][["person__name", "post__label", "org__name",  "org__image", "org__color"]].rename(columns={"post__label": "member_of", "org__name": "party_name", "org__image": "party_image", "org__color": "party_color"})

    # Merge to create final person table
    df_person = pd.merge(df_rep, df_party, on="person__name", how="left")
    df_person = df_person[["person__prefix", "person__name", "person__image", "member_of", "party_image", "party_color"]].rename(columns={"person__prefix": "prefix", "person__name": "person_name", "person__image": "image"})

    print(f"  Created person data: {len(df_person)} records")
    return df_person

def transform_vote_data(voting):
    """Transform voting data to normalized format"""
    print("\n4. Transforming vote data...")
    
    # Normalize votes
    df_votes = pd.json_normalize(
        data=voting,
        record_path=["votes", "voters"],
        meta=[
            ["votes", "option"],
            "title", "nickname", "classification", "publish_status", "start_date", "end_date", "pass_condition",
            "result", "agree_count", "disagree_count", "abstain_count", "novote_count"
        ],
        sep="__",
        record_prefix="voters__",
        meta_prefix="evt__"
    ).rename(columns={
        "evt__votes__option": "vote__option",
        "evt__title": "event__title",
        "evt__nickname": "event__nickname",
        "evt__classification": "event__classification",
        "evt__publish_status": "event__publish_status",
        "evt__start_date": "event__start_date",
        "evt__end_date": "event__end_date",
        "evt__pass_condition": "event__pass_condition",
        "evt__result": "event__result",
        "evt__agree_count": "event__agree_count",
        "evt__disagree_count": "event__disagree_count",
        "evt__abstain_count": "event__abstain_count",
        "evt__novote_count": "event__novote_count",
    })

    print(f"  Created vote data: {len(df_votes)} records")
    return df_votes

def create_person_vote_data(df_votes):
    """Create person vote summary dimension table"""
    print("\n5. Creating person vote summary...")
    
    # Filter for 2025 and aggregate by person and option
    df_person_vote = df_votes[df_votes["event__start_date"].str[:4] == "2025"].groupby(["voters__name", "vote__option"]).agg(no_of_option=("vote__option", "count")).reset_index()
    df_person_vote = df_person_vote.rename(columns={"voters__name": "person_name", "vote__option": "option"})
    df_person_vote = df_person_vote[df_person_vote["option"].isin(["เห็นด้วย", "ไม่เห็นด้วย", "งดออกเสียง", "ลา / ขาดลงมติ", "ไม่ลงคะแนน"])]

    print(f"  Created person vote summary: {len(df_person_vote)} records")
    return df_person_vote

def create_fact_data(df_votes, df_person):
    """Create fact table with vote results by province"""
    print("\n6. Creating fact data...")
    
    # Exclude PM selection vote
    exclude_title = "การพิจารณาให้ความเห็นชอบบุคคลซึ่งสมควรได้รับแต่งตั้งเป็นนายกรัฐมนตรี ตามมาตรา ๑๕๙ ของรัฐธรรมนูญแห่งราชอาณาจักรไทย"
    
    # Merge with person data to get province
    df_fact_votes = df_votes[df_votes["event__start_date"].str[:4] == "2025"][["event__title", "event__start_date", "event__end_date", "voters__name", "vote__option"]]
    df_fact_votes = pd.merge(df_fact_votes, df_person, left_on="voters__name", right_on="person_name", how="left")
    df_fact_votes = df_fact_votes[~(df_fact_votes["person_name"].isna()) & (df_fact_votes["event__title"] != exclude_title)].groupby(["event__title", "m__province", "vote__option"]).size().reset_index(name="no_of_option")

    # Find majority vote per province (handling ties)
    df_fact_votes = df_fact_votes[df_fact_votes["no_of_option"] == df_fact_votes.groupby(["event__title", "m__province"])["no_of_option"].transform("max")]

    # Handle ties between agree/disagree
    g = df_fact_votes.groupby(["event__title", "m__province"])["vote__option"]
    size = g.transform("size")
    has_yes = g.transform(lambda s: (s == "เห็นด้วย").any())
    has_no = g.transform(lambda s: (s == "ไม่เห็นด้วย").any())
    tie_mask = (size > 1) & has_yes & has_no

    df_fact_votes["result"] = df_fact_votes["vote__option"]
    df_fact_votes.loc[tie_mask, "result"] = "ผลโหวตเสมอ"
    df_fact_votes = df_fact_votes[["event__title", "m__province", "result"]].drop_duplicates()

    # Remove abstain/absent if there's another result
    for remove_option in ["ลา / ขาดลงมติ", "งดออกเสียง", "ไม่ลงคะแนนเสียง"]:
        g = df_fact_votes.groupby(["event__title", "m__province"])["result"]
        size = g.transform("size")
        tie_mask = (size > 1) & (df_fact_votes["result"] == remove_option)
        df_fact_votes.loc[tie_mask, "result"] = "ไม่เอา"
        df_fact_votes = df_fact_votes[df_fact_votes["result"] != "ไม่เอา"]

    # Calculate portions
    df_fact_portion = df_votes[df_votes["event__start_date"].str[:4] == "2025"][["event__title", "voters__name", "vote__option"]]
    df_fact_portion = pd.merge(df_fact_portion, df_person, left_on="voters__name", right_on="person_name", how="left")
    df_fact_portion = df_fact_portion[~(df_fact_portion["person_name"].isna()) & (df_fact_portion["event__title"] != exclude_title)].groupby(["event__title", "m__province", "vote__option"]).size().reset_index(name="no_of_option")

    # Calculate use right portion
    df_fact_portion["use_a_right"] = df_fact_portion["vote__option"].apply(lambda x: "ไม่ใช้สิทธิ์" if x == "ลา / ขาดลงมติ" else "ใช้สิทธิ์")
    df_fact_portion = df_fact_portion.groupby(["event__title", "m__province", "use_a_right"]).agg(no_of_person=("no_of_option", "sum")).reset_index()
    
    df_fact_total = df_fact_portion.groupby(["event__title", "m__province"])["no_of_person"].transform("sum")
    df_fact_portion["portion_use_right"] = df_fact_portion["no_of_person"] / df_fact_total

    g = df_fact_portion.groupby(["event__title", "m__province"])["use_a_right"]
    size = g.transform("size")
    tie_mask = (size > 1) & (df_fact_portion["use_a_right"] == "ไม่ใช้สิทธิ์")
    df_fact_portion.loc[tie_mask, "use_a_right"] = "ไม่เอา"
    df_fact_portion = df_fact_portion[df_fact_portion["use_a_right"] != "ไม่เอา"]

    # Merge results with portions
    df_fact_votes = pd.merge(df_fact_votes, df_fact_portion, on=["event__title", "m__province"], how="left")
    df_fact_votes.loc[(df_fact_votes["use_a_right"] == "ไม่ใช้สิทธิ์"), "portion_use_right"] = 0.0
    df_fact_votes["type"] = "All"

    # Calculate detailed option portions
    df_fact_option = df_votes[df_votes["event__start_date"].str[:4] == "2025"][["event__title", "voters__name", "vote__option"]]
    df_fact_option = pd.merge(df_fact_option, df_person, left_on="voters__name", right_on="person_name", how="left")
    df_fact_option = df_fact_option[~(df_fact_option["person_name"].isna()) & (df_fact_option["event__title"] != exclude_title)].groupby(["event__title", "m__province", "vote__option"]).size().reset_index(name="no_of_option")

    df_fact_size = df_fact_option.groupby(["event__title", "m__province"])["no_of_option"].transform("sum")
    df_fact_option["portion"] = df_fact_option["no_of_option"] / df_fact_size
    df_fact_option["type"] = df_fact_option["vote__option"]

    # Combine both fact tables
    df_fact_votes = df_fact_votes[["event__title", "m__province", "result", "portion_use_right", "type"]].rename(columns={"event__title": "title", "m__province": "province", "result": "option", "portion_use_right": "portion"})
    df_fact_option = df_fact_option[["event__title", "m__province", "vote__option", "portion", "type"]].rename(columns={"event__title": "title", "m__province": "province", "vote__option": "option"})
    
    df_fact = pd.concat([df_fact_votes, df_fact_option], ignore_index=True)

    print(f"  Created fact data: {len(df_fact)} records")
    return df_fact

def create_vote_detail_data(df_votes, df_person):
    """Create vote detail fact table"""
    print("\n7. Creating vote detail data...")
    
    exclude_title = "การพิจารณาให้ความเห็นชอบบุคคลซึ่งสมควรได้รับแต่งตั้งเป็นนายกรัฐมนตรี ตามมาตรา ๑๕๙ ของรัฐธรรมนูญแห่งราชอาณาจักรไทย"
    
    df_vote_detail = df_votes[df_votes["event__start_date"].str[:4] == "2025"][["event__title", "voters__name", "vote__option"]]
    df_vote_detail = pd.merge(df_vote_detail, df_person, left_on="voters__name", right_on="person_name", how="left")
    df_vote_detail = df_vote_detail[~(df_vote_detail["person_name"].isna()) & (df_vote_detail["event__title"] != exclude_title)]
    df_vote_detail = df_vote_detail[["event__title", "m__province", "voters__name", "vote__option"]].rename(columns={"event__title": "title", "m__province": "province", "voters__name": "person_name", "vote__option": "option"})

    print(f"  Created vote detail data: {len(df_vote_detail)} records")
    return df_vote_detail

def save_json(df, filename):
    """Save DataFrame to JSON file"""
    output_path = OUTPUT_DIR / filename
    df.to_json(output_path, orient="records", force_ascii=False, indent=2)
    print(f"  ✓ Saved {filename} ({len(df)} records)")

def main():
    print("=" * 60)
    print("Politigraph Data Generation Script")
    print("=" * 60)
    
    try:
        # Create output directory if needed
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        
        # Fetch data from API
        people = fetch_people()
        voting = fetch_vote_events()
        
        # Transform data
        df_person = transform_person_data(people)
        df_votes = transform_vote_data(voting)
        
        # Create dimension and fact tables
        df_person_vote = create_person_vote_data(df_votes)
        df_fact = create_fact_data(df_votes, df_person)
        df_vote_detail = create_vote_detail_data(df_votes, df_person)
        
        # Save to JSON files
        print("\n8. Saving JSON files...")
        save_json(df_person, "person_data.json")
        save_json(df_person_vote, "person_vote_data.json")
        save_json(df_fact, "fact_data.json")
        save_json(df_vote_detail, "vote_detail_data.json")
        
        print("\n" + "=" * 60)
        print("✓ Data generation completed successfully!")
        print("=" * 60)
        return 0
        
    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
