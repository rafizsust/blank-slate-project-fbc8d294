-- Insert Cambridge IELTS 14 Reading Test 2
INSERT INTO reading_tests (book_name, test_number, title, test_type, time_limit, total_questions, is_published)
VALUES ('Cambridge IELTS 14', 2, 'Reading Test 2', 'academic', 60, 40, true);

-- Get test ID and insert passages
WITH test_ref AS (
  SELECT id FROM reading_tests WHERE book_name = 'Cambridge IELTS 14' AND test_number = 2 LIMIT 1
)
INSERT INTO reading_passages (test_id, passage_number, title, content)
SELECT 
  test_ref.id,
  1,
  'Alexander Henderson (1831-1913)',
  'Born in Scotland in 1831, Alexander Henderson emigrated to Canada in 1855 and became a successful merchant. However, it was as a photographer that he made his name, and his photographs of the Canadian landscape are regarded as some of the finest examples of early Canadian photography.

Henderson''s career as a photographer began in the 1860s. He became a founding member of the Art Association of Montreal and helped to promote photography as an art form. His landscape photographs were widely exhibited, and in 1870 he won a medal at the Paris Exhibition.

Henderson was particularly interested in photographing the Canadian wilderness. He made numerous trips into the interior of Quebec and Ontario, and his photographs of mountains, lakes, and forests helped to define the Canadian landscape in the public imagination. His work was influential in the development of Canadian national identity, and his photographs were used by the Canadian Pacific Railway to promote tourism and settlement in western Canada.

In the 1870s, Henderson began to experiment with new photographic techniques. He was one of the first photographers in Canada to use the wet collodion process, which allowed for shorter exposure times and more detailed images. He also experimented with panoramic photography, creating wide-angle views of the Canadian landscape that were unprecedented in their scope and detail.

Henderson''s photographs were not merely technical achievements; they were also works of art. He had a keen eye for composition and lighting, and his photographs were carefully crafted to evoke a sense of the sublime. His images of mountains and waterfalls, in particular, were designed to inspire awe and wonder in the viewer.

In 1892, Henderson retired from photography and returned to Scotland, where he died in 1913. His photographs remain an important part of Canada''s cultural heritage, and his work continues to be exhibited in museums and galleries around the world.

Henderson''s contribution to Canadian photography cannot be overstated. He was a pioneer in the field, and his work helped to establish photography as a legitimate art form in Canada. His photographs of the Canadian landscape are not only beautiful but also historically significant, providing a valuable record of Canada''s natural heritage at a time when much of the country was still unexplored.

The technical quality of Henderson''s photographs is remarkable. His use of the wet collodion process allowed him to capture images with a level of detail that was unprecedented at the time. His panoramic photographs, in particular, demonstrate his mastery of the medium and his ability to create images that were both technically impressive and aesthetically pleasing.'
FROM test_ref;

WITH test_ref AS (
  SELECT id FROM reading_tests WHERE book_name = 'Cambridge IELTS 14' AND test_number = 2 LIMIT 1
)
INSERT INTO reading_passages (test_id, passage_number, title, content)
SELECT 
  test_ref.id,
  2,
  'Back to the future of skyscraper design',
  'In the early 1900s, the race was on to construct the world''s tallest building. As architects and engineers competed to reach new heights, they discovered that conventional building methods were inadequate for the task. The solution was the steel-frame structure, which allowed buildings to rise to unprecedented heights while remaining stable and safe.

Today, architects are again pushing the boundaries of skyscraper design, but with a different goal in mind: sustainability. The challenge is to create buildings that are not only tall but also environmentally friendly, reducing energy consumption and minimizing their carbon footprint.

One approach is to incorporate natural ventilation into building design. Traditional skyscrapers rely heavily on air conditioning, which consumes vast amounts of energy. By contrast, buildings designed with natural ventilation use the flow of air through the structure to regulate temperature, reducing the need for mechanical cooling.

The Commerzbank Tower in Frankfurt, Germany, completed in 1997, was one of the first skyscrapers to incorporate natural ventilation on a large scale. The building features a central atrium that acts as a natural chimney, drawing fresh air through the building and expelling stale air at the top. This design reduces the building''s energy consumption by up to 50 percent compared to conventional skyscrapers.

Another approach is to use renewable energy sources to power skyscrapers. Solar panels can be integrated into the building''s facade, generating electricity from sunlight. Wind turbines can be mounted on the roof or incorporated into the building''s structure, harnessing wind energy to supplement the power supply.

The Bahrain World Trade Center, completed in 2008, was the first skyscraper to integrate wind turbines into its design. Three large turbines are mounted between the building''s twin towers, generating up to 15 percent of the building''s electricity needs. The turbines are positioned to take advantage of the prevailing wind patterns in the region, maximizing their efficiency.

Green roofs and vertical gardens are another feature of sustainable skyscraper design. These living surfaces help to insulate the building, reducing heating and cooling costs. They also absorb rainwater, reducing runoff and the strain on urban drainage systems. In addition, they provide habitat for birds and insects, helping to restore biodiversity in urban areas.

The Bosco Verticale (Vertical Forest) in Milan, Italy, takes this concept to an extreme. Completed in 2014, the twin towers are covered with over 900 trees and 20,000 plants, creating a vertical ecosystem that absorbs carbon dioxide and produces oxygen. The vegetation also provides shade, reducing the need for air conditioning in summer.

Water conservation is another important aspect of sustainable skyscraper design. Rainwater harvesting systems collect water from the roof and store it for use in irrigation and toilet flushing. Greywater recycling systems treat wastewater from sinks and showers, making it suitable for non-potable uses.

The future of skyscraper design lies in the integration of all these approaches. The goal is to create buildings that are not only architecturally impressive but also environmentally responsible, minimizing their impact on the planet while providing comfortable and healthy spaces for people to live and work.'
FROM test_ref;

WITH test_ref AS (
  SELECT id FROM reading_tests WHERE book_name = 'Cambridge IELTS 14' AND test_number = 2 LIMIT 1
)
INSERT INTO reading_passages (test_id, passage_number, title, content)
SELECT 
  test_ref.id,
  3,
  'Why companies should welcome disorder',
  'For decades, management experts have preached the virtues of order, efficiency, and careful planning. But a growing body of research suggests that a certain amount of disorder may actually be beneficial for organizations.

The traditional view of management emphasizes predictability and control. Processes are standardized, roles are clearly defined, and hierarchies are established to ensure that everyone knows their place. This approach has many advantages: it reduces confusion, minimizes errors, and allows organizations to scale up their operations efficiently.

However, this emphasis on order can also have drawbacks. When processes become too rigid, organizations may struggle to adapt to changing circumstances. Employees may become disengaged if their roles are too narrowly defined, and innovation may suffer if new ideas are discouraged in favor of established procedures.

Research by organizational theorists has shown that some of the most successful companies embrace a degree of disorder. They encourage experimentation, tolerate failure, and allow employees the freedom to pursue their own ideas. This approach can foster creativity and innovation, helping organizations to stay ahead of their competitors.

One example is the technology company Google, which famously allowed its employees to spend 20 percent of their time working on projects of their own choosing. This policy led to the development of some of Google''s most successful products, including Gmail and Google News. By giving employees the freedom to experiment, Google was able to tap into their creativity and generate ideas that might never have emerged through traditional top-down management.

Another example is the pharmaceutical company Johnson & Johnson, which has a decentralized structure that gives its individual business units a high degree of autonomy. This allows each unit to respond quickly to local market conditions and customer needs, without having to wait for approval from headquarters. The result is a more agile and responsive organization.

Of course, not all disorder is beneficial. Too much chaos can lead to confusion, wasted resources, and poor decision-making. The key is to find the right balance between order and disorder, creating an environment that is structured enough to be efficient but flexible enough to adapt and innovate.

Some researchers have suggested that organizations should aim for a state of "managed chaos" or "bounded instability." This means creating a framework of rules and procedures that provides a baseline of order, while leaving room for experimentation and creative problem-solving within those boundaries.

This approach requires a different kind of leadership. Instead of trying to control every aspect of the organization, leaders need to create the conditions that allow creativity to flourish. This means trusting employees, tolerating failure, and being willing to take risks.

The benefits of embracing disorder extend beyond innovation. Research has shown that employees who have more autonomy and freedom in their work tend to be more engaged and satisfied. They are also more likely to stay with their employers, reducing turnover and the costs associated with recruiting and training new staff.

In conclusion, while order and efficiency remain important, organizations should not be afraid to embrace a certain amount of disorder. By finding the right balance, they can foster innovation, improve employee engagement, and ultimately achieve greater success.'
FROM test_ref;