const fs = require('fs');

const niches = [
    'Accountants', 'Real Estate Agents', 'Plumbers', 'HVAC Companies', 'Dentists',
    'MedSpas', 'Law Firms', 'Cleaning Services', 'Roofing Companies', 'Electricians',
    'Landscaping', 'Moving Companies', 'Restaurants', 'Gyms', 'Salons',
    'Web Designers', 'Marketing Agencies', 'IT Services', 'Consultants', 'Chiropractors',
    'Pest Control', 'Painters', 'General Contractors', 'Auto Repair Shops', 'Caterers'
];

const topics = [
    {
        title: "How to Find Email Addresses for Local {Niche} in 2024",
        slug: "find-email-addresses-local-{niche-slug}-2024",
        excerpt: "Learn the easiest way to scrape verified contact information and emails for local {Niche} using Google Maps and automation.",
        tag: "Lead Generation"
    },
    {
        title: "The Ultimate Guide to Selling B2B Services to {Niche}",
        slug: "ultimate-guide-selling-b2b-services-{niche-slug}",
        excerpt: "Discover high-converting cold email strategies and outreach tactics specifically tailored for {Niche}.",
        tag: "B2B Sales"
    }
];

const posts = [];

niches.forEach(niche => {
    topics.forEach(topic => {
        const title = topic.title.replace(/{Niche}/g, niche);
        const slug = topic.slug.replace(/{niche-slug}/g, niche.toLowerCase().replace(/\s+/g, '-'));
        const excerpt = topic.excerpt.replace(/{Niche}/g, niche);

        const content = `## Leveraging local data for ${niche}
If you offer marketing, SaaS, or financial services, **${niche}** are some of the best potential clients you can target. They have high customer lifetime value and are always looking for ways to streamline their operations.
### Step 1: Building your List
The first step to outreach is finding who to contact. Using a tool like **Skill Scraper**, you can open Google Maps, search for "${niche} in [City]", and instantly extract their website, phone number, and public contact emails.
### Step 2: Crafting the perfect offer
When emailing ${niche.toLowerCase()}, keep it brief. Focus on a specific pain point. For example, mention a missing SEO tag on their website or offer a free audit of their current processes.
### Step 3: Following Up
Always follow up 2-3 times. ${niche} are busy running their businesses and might miss the first email. Use the exported CSV from Skill Scraper directly in your cold email sequence software!`;

        posts.push(`(
            '${title.replace(/'/g, "''")}',
            '${slug}',
            '${excerpt.replace(/'/g, "''")}',
            '${content.replace(/'/g, "''")}',
            '${topic.tag}',
            '3 min',
            '${title.replace(/'/g, "''")}',
            '${excerpt.replace(/'/g, "''").substring(0, 150)}',
            ARRAY['${niche}', 'b2b', 'lead generation']::text[],
            true
        )`);
    });
});

const sql = `
-- Insert 50 highly targeted SEO blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, tag, read_time, meta_title, meta_description, meta_keywords, published)
VALUES
${posts.join(',\n')};
`;

fs.writeFileSync('C:\\Users\\Veer Bhanushali\\.gemini\\antigravity\\brain\\30e9dc08-6f43-49f4-b4c2-018bea130a43\\50_seo_blogs.sql', sql);
console.log('Successfully generated 50_seo_blogs.sql');
