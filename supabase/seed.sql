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
       'Shema', 'Jay', 'Instagram', 'script'),
      ('Day in the life: agency owner edition',
       'Filmed last Tuesday. 6am to 9pm cut down to 90 seconds.',
       '4K footage in Drive folder.',
       'Shema', 'Mike', 'TikTok', 'edit'),
      ('Testimonial: $4K to $28K in 60 days',
       'Client testimonial montage.',
       'Caption pass needed before posting.',
       'Shema', 'Mike', 'Instagram', 'review'),
      ('Webinar replay clips (3-pack)',
       'Cut into 3 standalone hooks.',
       'Already posted to YT.',
       'Shema', 'Jay', 'YouTube', 'posted');
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
       'Cut script for stop-selling-projects reel. Review Mike testimonial edit.',
       9.0, 'green'),
      ('Mike', current_date - 1,
       'Finished testimonial montage. Got feedback from Shema. v2 in progress.',
       'Source footage missing one b-roll clip.',
       'v2 of testimonial. Start day-in-the-life rough cut.',
       7.5, 'yellow'),
      ('Jay', current_date - 1,
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
-- SOPs
-- ============================================================
do $$
begin
  if not exists (select 1 from public.hub_sops) then
    insert into public.hub_sops (title, category, body, tags, pinned) values
      ('How we cut reels',
       'editing',
       E'Goal: 60-90 second reels that hook in under 3s and pay off the hook by the end.\n\n1. Pull source from Drive folder named YYYY-MM-DD_topic.\n2. Cut hook first. If it does not land, kill the reel.\n3. B-roll every 2-3 seconds, never let the screen sit static.\n4. Subtitles on by default, brand caption style v2.\n5. Final pass: review on phone, in silent mode, in landscape. If it works without sound, you are done.\n6. Export 1080x1920 H.264, name reel_YYYY-MM-DD_topic_v1.mp4 and drop in Drive > Ready.\n7. Drop the asset URL into the pipeline card and move to Review.',
       ARRAY['reels','editing','workflow'],
       true),
      ('Daily EOD expectations',
       'ops',
       E'Submit your EOD by 7pm local time. 60 seconds, max.\n\n- Wins: what shipped today. Be specific.\n- Blockers: what stopped you. Tag people if you need them.\n- Tomorrow: top 1-3 things. If it is more than 3, you are lying.\n- Mood: green/yellow/red. Do not lie to look good.\n\nIf you miss a day, no big deal. If you miss 3 in a row, expect a check-in.',
       ARRAY['eod','daily'],
       true),
      ('Webinar shoot checklist',
       'production',
       E'Day before:\n- Charge cameras (A + B)\n- Charge lav + backup lav\n- Charge laptop fully\n- Backup SD cards in slot 2 of both cams\n- Whiteboard wiped, fresh markers tested\n\nDay of:\n- Run-through of slides 30 min before\n- Mic check at recording volume\n- 60 second test record, listen on headphones\n- Hit record on both cameras\n- Clap on camera at top to sync\n\nAfter:\n- Pull SD cards to Drive within 2 hours\n- Backup to external drive\n- Slack the editor when files are uploaded',
       ARRAY['webinar','shoot','production'],
       false),
      ('How we run sales calls',
       'sales',
       E'Pre-call:\n- Review their typeform answers\n- Check their socials for context\n\nCall structure (45 min):\n- 5 min rapport + agenda set\n- 15 min discovery (current state, what they have tried, why now)\n- 10 min vision (what does success look like in 90 days)\n- 10 min offer pitch\n- 5 min close / next steps\n\nClose moves:\n- Do not answer let-me-think-about-it with ok. Always ask what specifically.\n- If it is a money objection, payment plan. If it is a time objection, scoped timeline.',
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
       'Mike', 'ops', 'open', 4),
      ('Standardize hook templates so editors can prep B-roll faster',
       'If hooks always follow one of 4 shapes, we can pre-cut B-roll and shave 30 min per reel.',
       'Jay', 'editing', 'planned', 7),
      ('Friday roundup post: best reels of the week',
       'Repurpose top 3 reels into a Friday compilation post. Free content, double the reach.',
       'Shema', 'content', 'open', 2),
      ('Auto-generate caption first drafts from script',
       'GPT pass on the script to draft captions. Editor refines instead of writing from scratch.',
       null, 'editing', 'shipped', 9);
  end if;
end $$;
