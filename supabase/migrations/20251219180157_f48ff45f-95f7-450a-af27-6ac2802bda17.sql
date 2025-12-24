-- Parse and insert paragraphs for Cambridge 20 test from passage content
-- Passage 1: Deer Farming in Australia (7 paragraphs A-G)
INSERT INTO reading_paragraphs (passage_id, label, content, is_heading, order_index)
SELECT 
  '59c7dfe4-d077-433d-bbd1-91a02291ce17',
  unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G']),
  unnest(ARRAY[
    'The Australian deer-farming industry has grown significantly since its beginnings in the 1970s. Today, there are approximately 1,000 deer farms across the country, with the majority located in Victoria, New South Wales, and Tasmania. The industry produces venison (deer meat), velvet antler, and breeding stock for both domestic and international markets.',
    'Deer are not native to Australia. The six species now farmed – red deer, fallow deer, rusa deer, chital deer, sambar deer, and elk (wapiti) – were introduced during the nineteenth and early twentieth centuries for sport hunting. Some escaped or were released, establishing wild populations that still exist in various parts of Australia. The development of deer farming has drawn on both these wild populations and imported stock.',
    'The Australian deer industry has had to develop its own expertise since there was no tradition of deer farming in this country. Farmers have had to learn how to handle, feed, and breed deer, as well as how to process and market venison and velvet. This has required significant investment in research and development, much of it funded by the industry itself through levies on producers.',
    'Venison is the main product of the Australian deer industry, accounting for about 60 percent of farm income. Australian venison is lean, tender, and mild-flavored, and is marketed as a healthy, premium meat. Most venison is sold domestically, though there is a growing export market, particularly in Asia. The industry has worked hard to develop a consistent, high-quality product and to establish reliable supply chains to restaurants and retailers.',
    'Velvet antler, which is harvested from male deer before it hardens into bone, is the second most important product. It is used in traditional Asian medicine and as a dietary supplement. Australia exports most of its velvet to South Korea, China, and other Asian markets. The harvest of velvet is carefully regulated to ensure animal welfare standards are maintained.',
    'The deer-farming industry faces several challenges. These include competition from other meats, fluctuating demand in export markets, and the need to maintain high standards of animal welfare and environmental sustainability. Climate change is also a concern, as deer are susceptible to heat stress and require access to shade and water during hot weather.',
    'Despite these challenges, the industry is optimistic about its future. There is growing consumer interest in alternative meats that are seen as healthier and more environmentally sustainable than traditional beef and lamb. Deer are efficient converters of pasture to meat and have a lower environmental footprint than cattle. The industry is also exploring new products and markets, including deer milk, deer leather, and deer-based pharmaceuticals.'
  ]),
  false,
  unnest(ARRAY[0, 1, 2, 3, 4, 5, 6])
WHERE NOT EXISTS (
  SELECT 1 FROM reading_paragraphs WHERE passage_id = '59c7dfe4-d077-433d-bbd1-91a02291ce17'
);

-- Passage 2: The History of the Compass (no labeled paragraphs, insert as single blocks)
INSERT INTO reading_paragraphs (passage_id, label, content, is_heading, order_index)
SELECT 
  'ec4f9dca-7648-4756-ae4b-61debe3049b1',
  '',
  unnest(ARRAY[
    'The magnetic compass is one of the most important inventions in human history. It enabled sailors to navigate across oceans, explorers to map continents, and armies to march across deserts. Yet its origins remain somewhat mysterious.',
    'The earliest references to magnetic compasses come from China, dating back to around the 4th century BC. These early devices used lodestone, a naturally magnetized iron ore, to indicate direction. The Chinese initially used the compass for feng shui – the art of placing buildings and objects in harmony with their environment – rather than for navigation.',
    'The first documented use of a magnetic compass for navigation appears in Chinese records from the 11th century AD. By this time, the Chinese had discovered that a magnetized needle, if allowed to rotate freely, would align itself with the Earth''s magnetic field. They suspended these needles on silk threads or floated them on water to create navigational instruments.',
    'The compass reached the Islamic world by the 12th century, probably through trade routes connecting China with the Middle East. Arab scholars quickly recognized its potential for navigation and began to incorporate it into their maritime traditions. They also made improvements to the design, including the development of the dry compass, which used a pivoting needle rather than a floating one.',
    'The compass arrived in Europe around the same time, either through Arab intermediaries or via the Silk Road. European sailors rapidly adopted it for navigation, and by the 13th century, it had become an essential tool for maritime trade. The Mediterranean maritime republics of Venice, Genoa, and Amalfi were particularly important in spreading compass technology throughout Europe.',
    'European craftsmen and scientists continued to refine the compass over the following centuries. They developed the compass rose, which showed direction more precisely, and the gimbal mount, which kept the compass level on rolling ships. They also discovered that the magnetic north pole does not coincide exactly with the geographic north pole – a phenomenon known as magnetic declination.',
    'The 19th century saw further advances in compass technology. Scientists developed methods to compensate for the magnetic interference caused by iron and steel ships. They also created more accurate and reliable compass mechanisms. By the end of the century, the modern marine compass had essentially reached its final form.',
    'Today, the magnetic compass has been largely supplanted by electronic navigation systems such as GPS. However, it remains an essential backup on ships and aircraft, and is still used by hikers, orienteers, and others who need a reliable, battery-free way to find their direction.'
  ]),
  false,
  unnest(ARRAY[0, 1, 2, 3, 4, 5, 6, 7])
WHERE NOT EXISTS (
  SELECT 1 FROM reading_paragraphs WHERE passage_id = 'ec4f9dca-7648-4756-ae4b-61debe3049b1'
);

-- Passage 3: Sleep and Memory Consolidation (no labeled paragraphs)
INSERT INTO reading_paragraphs (passage_id, label, content, is_heading, order_index)
SELECT 
  'fcd0b1fd-4c46-470e-911a-a40371c1810e',
  '',
  unnest(ARRAY[
    'The relationship between sleep and memory has fascinated scientists for over a century. Early researchers observed that sleep seemed to protect newly acquired memories from interference and decay. More recent studies have shown that sleep plays an active role in memory consolidation – the process by which new memories are stabilized and integrated into existing knowledge.',
    'Memory consolidation during sleep appears to involve the reactivation of neural patterns that were active during learning. Studies using brain imaging have shown that the same brain regions that are active when learning a new task are reactivated during subsequent sleep. This reactivation is thought to strengthen the neural connections underlying the memory.',
    'Different stages of sleep appear to be important for different types of memory. Slow-wave sleep, the deepest stage of non-REM sleep, seems to be particularly important for declarative memories – memories for facts and events. During slow-wave sleep, the brain replays memories and transfers them from the hippocampus, where they are initially stored, to the neocortex, where they are stored long-term.',
    'REM sleep, the stage associated with vivid dreaming, appears to be more important for procedural memories – memories for skills and procedures. Studies have shown that people who are deprived of REM sleep after learning a motor skill show less improvement than those who sleep normally. REM sleep may also be important for emotional memory processing.',
    'The role of sleep in memory consolidation has important practical implications. Students who get adequate sleep after studying are likely to remember more than those who stay up all night cramming. Athletes who sleep well after practice may show greater improvement in their skills. And people recovering from trauma may benefit from sleep that helps process and integrate difficult experiences.',
    'Recent research has explored ways to enhance memory consolidation during sleep. Some studies have shown that playing sounds or smells associated with learned material during sleep can boost memory performance. Others have investigated the use of electrical stimulation to enhance the brain rhythms associated with memory consolidation.',
    'Despite these advances, many questions remain about the relationship between sleep and memory. Scientists are still working to understand exactly how and why sleep benefits memory, and how these processes might be affected by sleep disorders, aging, and neurological conditions. The answers to these questions could have important implications for education, therapy, and the treatment of memory disorders.'
  ]),
  false,
  unnest(ARRAY[0, 1, 2, 3, 4, 5, 6])
WHERE NOT EXISTS (
  SELECT 1 FROM reading_paragraphs WHERE passage_id = 'fcd0b1fd-4c46-470e-911a-a40371c1810e'
);