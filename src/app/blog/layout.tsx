import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Blog — Google Maps Scraping Tips & Lead Generation Guides',
    description: 'Learn how to extract business data from Google Maps, find WhatsApp numbers, emails, and social media profiles. Expert tips on lead generation and B2B prospecting.',
    keywords: ['google maps scraping guide', 'lead generation tips', 'business data extraction', 'whatsapp number finder', 'email scraping tutorial'],
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
