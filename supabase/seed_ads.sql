-- Seed data for hub_ads (Ad creatives pipeline)
-- Idempotent: only inserts if the table is empty. Safe to re-run.

do $$
begin
  if not exists (select 1 from public.hub_ads) then
    insert into public.hub_ads
      (title, hook, owner, editor, platform, campaign, ad_set,
       stage, creative_type, format,
       amount_spent, impressions, cpm, ctr, results, cost_per_result, frequency,
       launched_at, metrics_updated_at)
    values
      ('Marcus 30s testimonial VSL',
       'I went from $4K projects to $30K retainers in 90 days.',
       'Shema', 'Keon', 'Meta',
       'Q3 - Cold Acquisition', 'Cold AU 25-45 LAL 1%',
       'scaling', 'dynamic', '9:16',
       2840.50, 412000, 6.89, 1.872, 47, 60.43, 1.85,
       now() - interval '21 days', now() - interval '1 hour'),

      ('Three pricing moves static carousel',
       'Stop selling projects. Start building an agency.',
       'Shema', 'Rasharn', 'Meta',
       'Q3 - Cold Acquisition', 'Cold US 25-50 Broad',
       'testing', 'static', 'carousel',
       412.00, 58200, 7.08, 0.945, 6, 68.67, 1.12,
       now() - interval '4 days', now() - interval '3 hours'),

      ('Whiteboard explainer · proof loop',
       'The 3-step framework that built a $250K/yr agency.',
       'Shema', 'Keon', 'Meta',
       'Q3 - Cold Acquisition', 'Cold AU 25-45 LAL 2%',
       'scaling', 'dynamic', '4:5',
       1920.00, 287400, 6.68, 2.134, 38, 50.53, 1.94,
       now() - interval '14 days', now() - interval '2 hours'),

      ('Day in the life · static set (3 variations)',
       'A day in the life of a $30K/mo agency owner.',
       'Shema', 'Rasharn', 'Meta',
       'Q3 - Cold Acquisition', 'Cold UK 25-45 LAL 1%',
       'review', 'static', '1:1',
       null, null, null, null, null, null, null,
       null, null),

      ('Failed hook test · burn it down',
       'Did you know videographers leave $50K on the table?',
       'Shema', 'Keon', 'Meta',
       'Q3 - Cold Acquisition', 'Cold AU 25-45 LAL 1%',
       'killed', 'dynamic', '9:16',
       340.20, 51200, 6.64, 0.412, 1, 340.20, 1.08,
       now() - interval '12 days', now() - interval '5 days'),

      ('Concept: founder-led reel #4 (objection killers)',
       'But you do not know my niche...',
       'Shema', null, 'Meta',
       'Q3 - Cold Acquisition', null,
       'concept', null, null,
       null, null, null, null, null, null, null,
       null, null),

      ('Production: 5-frame static · pricing tiers',
       null,
       'Shema', 'Rasharn', 'Meta',
       'Q3 - Cold Acquisition', 'Cold US 25-50 Broad',
       'production', 'static', 'carousel',
       null, null, null, null, null, null, null,
       null, null);
  end if;
end $$;
