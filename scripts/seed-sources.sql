-- Seed script for news sources - POLITICAL NEWS ONLY
-- Run this in your Supabase SQL editor
-- All RSS feeds are filtered to politics/political news sections

INSERT INTO sources (name, home_url, rss_url, bias_label, authority_score, country, language, active) VALUES
-- Left-leaning sources (Political RSS feeds)
('The New York Times', 'https://www.nytimes.com', 'https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/section/politics/rss.xml', 'Left', 0.9, 'US', 'en', true),
('The Washington Post', 'https://www.washingtonpost.com', 'https://feeds.washingtonpost.com/rss/politics', 'Left', 0.9, 'US', 'en', true),
('CNN Politics', 'https://www.cnn.com', 'http://rss.cnn.com/rss/cnn_allpolitics.rss', 'Left', 0.85, 'US', 'en', true),
('The Guardian US Politics', 'https://www.theguardian.com', 'https://www.theguardian.com/us-news/us-politics/rss', 'Left', 0.85, 'UK', 'en', true),
('NPR Politics', 'https://www.npr.org', 'https://feeds.npr.org/1014/rss.xml', 'Center-Left', 0.9, 'US', 'en', true),
('MSNBC Politics', 'https://www.msnbc.com', 'https://www.msnbc.com/feeds/politics', 'Left', 0.8, 'US', 'en', true),
('Politico', 'https://www.politico.com', 'https://www.politico.com/rss/politicopicks.xml', 'Center-Left', 0.85, 'US', 'en', true),
('Vox Politics', 'https://www.vox.com', 'https://www.vox.com/policy-and-politics/rss/index.xml', 'Left', 0.75, 'US', 'en', true),
('The Atlantic Politics', 'https://www.theatlantic.com', 'https://www.theatlantic.com/politics/feed/', 'Center-Left', 0.85, 'US', 'en', true),
('HuffPost Politics', 'https://www.huffpost.com', 'https://www.huffpost.com/section/politics/feed', 'Left', 0.7, 'US', 'en', true),
('Slate Politics', 'https://slate.com', 'https://slate.com/feeds/news-and-politics/politics.rss', 'Left', 0.75, 'US', 'en', true),
('The New Yorker Politics', 'https://www.newyorker.com', 'https://www.newyorker.com/feed/news/politics', 'Center-Left', 0.9, 'US', 'en', true),
('Mother Jones Politics', 'https://www.motherjones.com', 'https://www.motherjones.com/politics/feed/', 'Left', 0.7, 'US', 'en', true),
('The Nation Politics', 'https://www.thenation.com', 'https://www.thenation.com/politics/feed/', 'Left', 0.75, 'US', 'en', true),
('Democracy Now', 'https://www.democracynow.org', 'https://www.democracynow.org/democracynow.rss', 'Left', 0.7, 'US', 'en', true),
('The Intercept Politics', 'https://theintercept.com', 'https://theintercept.com/politics/feed/', 'Left', 0.75, 'US', 'en', true),
('Jacobin Politics', 'https://www.jacobinmag.com', 'https://www.jacobinmag.com/topic/politics/feed', 'Left', 0.7, 'US', 'en', true),
('Common Dreams Politics', 'https://www.commondreams.org', 'https://www.commondreams.org/topic/politics/feed', 'Left', 0.65, 'US', 'en', true),

-- Center sources (Political RSS feeds)
('Reuters Politics', 'https://www.reuters.com', 'https://www.reuters.com/rssFeed/politicsNews', 'Center', 0.95, 'US', 'en', true),
('Associated Press Politics', 'https://apnews.com', 'https://apnews.com/apf-politics', 'Center', 0.95, 'US', 'en', true),
('BBC US & Canada', 'https://www.bbc.com/news', 'http://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', 'Center', 0.9, 'UK', 'en', true),
('PBS NewsHour Politics', 'https://www.pbs.org/newshour', 'https://www.pbs.org/newshour/politics/feed', 'Center', 0.9, 'US', 'en', true),
('C-SPAN', 'https://www.c-span.org', 'https://www.c-span.org/rss/cspan/cspan.xml', 'Center', 0.85, 'US', 'en', true),
('The Hill', 'https://thehill.com', 'https://thehill.com/rss/syndicator/19110', 'Center', 0.8, 'US', 'en', true),
('USA Today Politics', 'https://www.usatoday.com', 'https://www.usatoday.com/rss/politics/', 'Center', 0.8, 'US', 'en', true),
('Bloomberg Politics', 'https://www.bloomberg.com', 'https://www.bloomberg.com/politics/feeds/site.xml', 'Center', 0.85, 'US', 'en', true),
('Financial Times US Politics', 'https://www.ft.com', 'https://www.ft.com/us-politics?format=rss', 'Center', 0.9, 'UK', 'en', true),
('The Wall Street Journal Politics', 'https://www.wsj.com', 'https://www.wsj.com/xml/rss/3_7014.xml', 'Center-Right', 0.9, 'US', 'en', true),
('The Economist US Politics', 'https://www.economist.com', 'https://www.economist.com/united-states/feed', 'Center', 0.9, 'UK', 'en', true),
('Axios Politics', 'https://www.axios.com', 'https://api.axios.com/feed/politics/', 'Center', 0.8, 'US', 'en', true),
('PolitiFact', 'https://www.politifact.com', 'https://www.politifact.com/feeds/news/', 'Center', 0.85, 'US', 'en', true),
('FactCheck.org', 'https://www.factcheck.org', 'https://www.factcheck.org/feed/', 'Center', 0.85, 'US', 'en', true),

-- Right-leaning sources (Political RSS feeds)
('Fox News Politics', 'https://www.foxnews.com', 'http://feeds.foxnews.com/foxnews/politics', 'Right', 0.8, 'US', 'en', true),
('The Wall Street Journal Opinion', 'https://www.wsj.com', 'https://www.wsj.com/xml/rss/3_7041.xml', 'Right', 0.85, 'US', 'en', true),
('National Review', 'https://www.nationalreview.com', 'https://www.nationalreview.com/feed/', 'Right', 0.8, 'US', 'en', true),
('The Washington Times Politics', 'https://www.washingtontimes.com', 'https://www.washingtontimes.com/rss/headlines/politics/', 'Right', 0.75, 'US', 'en', true),
('The Daily Caller Politics', 'https://dailycaller.com', 'https://dailycaller.com/section/politics/feed/', 'Right', 0.7, 'US', 'en', true),
('Breitbart Politics', 'https://www.breitbart.com', 'https://www.breitbart.com/politics/feed/', 'Right', 0.65, 'US', 'en', true),
('The Federalist', 'https://thefederalist.com', 'https://thefederalist.com/feed/', 'Right', 0.75, 'US', 'en', true),
('Washington Examiner Politics', 'https://www.washingtonexaminer.com', 'https://www.washingtonexaminer.com/rss/politics', 'Right', 0.75, 'US', 'en', true),
('Townhall Politics', 'https://townhall.com', 'https://townhall.com/tipsheet/feed', 'Right', 0.7, 'US', 'en', true),
('RedState Politics', 'https://redstate.com', 'https://redstate.com/politics/feed/', 'Right', 0.7, 'US', 'en', true),
('The Blaze Politics', 'https://www.theblaze.com', 'https://www.theblaze.com/politics/feed', 'Right', 0.7, 'US', 'en', true),
('Newsmax Politics', 'https://www.newsmax.com', 'https://www.newsmax.com/rss/politics/rssid/1/', 'Right', 0.7, 'US', 'en', true),
('The American Conservative', 'https://www.theamericanconservative.com', 'https://www.theamericanconservative.com/feed/', 'Right', 0.75, 'US', 'en', true),
('The Heritage Foundation', 'https://www.heritage.org', 'https://www.heritage.org/rss', 'Right', 0.8, 'US', 'en', true),
('Cato Institute', 'https://www.cato.org', 'https://www.cato.org/rss', 'Right', 0.8, 'US', 'en', true),
('Reason Politics', 'https://reason.com', 'https://reason.com/politics/feed/', 'Right', 0.75, 'US', 'en', true),
('The Daily Wire Politics', 'https://www.dailywire.com', 'https://www.dailywire.com/politics/feed', 'Right', 0.7, 'US', 'en', true),
('The Epoch Times Politics', 'https://www.theepochtimes.com', 'https://www.theepochtimes.com/politics/feed/', 'Right', 0.65, 'US', 'en', true)
ON CONFLICT DO NOTHING;



