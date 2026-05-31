-- Seed data for Shema Team Hub.
-- Idempotent: each block only runs if the table is empty.
-- Safe to re-run.

-- ============================================================
-- Priorities
-- ============================================================
do $$
begin
  if not exists (select 1 from public.hub_priorities) then
    insert into public.hub_priorities (title, description, owner, priority, status, due_date) values
      ('Hit 30 reels posted this month',
       'Track in pipeline. Goal: 5/week minimum across all platforms.',
       'Shema', 1, 'in_progress', current_date + 14),
      ('Lock new positioning across all content',
       'Switch from videographer to agency owner language. See tam-positioning.md.',
       'Shema', 1, 'in_progress', current_date + 7),
      ('Ship Q3 webinar funnel revision',
       'Apply learnings from last cohort. Update VSL hook and slides.',
       'Ellis', 2, 'open', current_date + 21),
      ('Build review SLA: under 24h editor turnaround',
       'Need feedback within 24h or it bottlenecks next shoot.',
       'Editor team', 2, 'open', null),
      ('Document the n8n workflow library',
       'Each of the 6 workflows needs a 1-pager SOP.',
       'Ellis', 3, 'open', current_date + 14);
  end if;
end $$;

-- ============================================================
-- Pipeline
-- ============================================================
do $$
begin
  if not exists (select 1 from public.hub_pipeline) then
    insert into public.hub_pipeline (title, hook, notes, owner, editor, platform, stage) values
      ('Stop selling projects, start building an agency',
       'You do not have a videography problem, you have a positioning problem.',
       'Hard cut to whiteboard breakdown.',
       'Shema', null, 'Instagram', 'idea'),
      ('The $30K/mo Marcus call breakdown',
       'How Marcus went from $4K projects to $30K retainers in 90 days.',
       'Pull clip from coaching call (with permission).',
       'Shema', null, 'YouTube', 'idea'),
      ('Three pricing moves that 10x agency revenue',
       'You are not undercharging, you are under-positioning.',
       'Use B-roll from latest cohort.',
       'Shema', 'Rasharn', 'Instagram', 'script'),
      ('Day in the life: agency owner edition',
       'Filmed last Tuesday. 6am to 9pm cut down to 90 seconds.',
       '4K footage in Drive folder.',
       'Shema', 'Keon', 'TikTok', 'edit'),
      ('Testimonial: $4K to $28K in 60 days',
       'Client testimonial montage.',
       'Caption pass needed before posting.',
       'Shema', 'Keon', 'Instagram', 'review'),
      ('Webinar replay clips (3-pack)',
       'Cut into 3 standalone hooks.',
       'Already posted to YT.',
       'Shema', 'Rasharn', 'YouTube', 'posted');
  end if;
end $$;

-- ============================================================
-- EOD reports
-- ============================================================
do $$
begin
  if not exists (select 1 from public.hub_eod) then
    insert into public.hub_eod (author, report_date, wins, blockers, tomorrow, hours_worked, mood) values
      ('Shema', current_date - 1,
       'Shot 4 reels. Recorded webinar segment 2.',
       'Need new on-camera shirt before Thursday shoot.',
       'Cut script for stop-selling-projects reel. Review Keon testimonial edit.',
       9.0, 'green'),
      ('Keon', current_date - 1,
       'Finished testimonial montage. Got feedback from Shema. v2 in progress.',
       'Source footage missing one b-roll clip.',
       'v2 of testimonial. Start day-in-the-life rough cut.',
       7.5, 'yellow'),
      ('Rasharn', current_date - 1,
       'Wrapped 3-pricing-moves rough cut. Sent to Shema.',
       'None.',
       'Captions pass on webinar clips.',
       8.0, 'green'),
      ('Shema', current_date - 2,
       'Coaching calls all morning. Recorded 2 talking-head clips in afternoon.',
       'Lighting setup took longer than expected.',
       '4 reels. Webinar prep.',
       8.5, 'green');
  end if;
end $$;

-- ============================================================
-- SOPs (link-based — point to the actual doc, do not store body)
-- Replace the placeholder URLs below with your real Google Doc / Notion links.
-- ============================================================
do $$
begin
  if not exists (select 1 from public.hub_sops) then
    insert into public.hub_sops (title, category, url, tags, pinned) values
      ('How we cut reels',
       'editing',
       'https://docs.google.com/document/d/REPLACE_ME_REELS_SOP',
       ARRAY['reels','editing','workflow'],
       true),
      ('Daily EOD expectations',
       'ops',
       'https://docs.google.com/document/d/REPLACE_ME_EOD_SOP',
       ARRAY['eod','daily'],
       true),
      ('Webinar shoot checklist',
       'production',
       'https://docs.google.com/document/d/REPLACE_ME_WEBINAR_SOP',
       ARRAY['webinar','shoot','production'],
       false),
      ('How we run sales calls',
       'sales',
       'https://docs.google.com/document/d/REPLACE_ME_SALES_SOP',
       ARRAY['sales','calls'],
       false);
  end if;
end $$;

-- ============================================================
-- Suggestions
-- ============================================================
do $$
begin
  if not exists (select 1 from public.hub_suggestions) then
    insert into public.hub_suggestions (title, body, author, area, status, upvotes) values
      ('Move asset handoff from Slack to Drive notifications',
       'Slack messages with file links get buried. Drive notifications would be cleaner and searchable.',
       'Keon', 'ops', 'open', 4),
      ('Standardize hook templates so editors can prep B-roll faster',
       'If hooks always follow one of 4 shapes, we can pre-cut B-roll and shave 30 min per reel.',
       'Rasharn', 'editing', 'planned', 7),
      ('Friday roundup post: best reels of the week',
       'Repurpose top 3 reels into a Friday compilation post. Free content, double the reach.',
       'Shema', 'content', 'open', 2),
      ('Auto-generate caption first drafts from script',
       'GPT pass on the script to draft captions. Editor refines instead of writing from scratch.',
       null, 'editing', 'shipped', 9);
  end if;
end $$;
