const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class CyberneticZooScraper {
    constructor() {
        this.baseUrl = 'https://cyberneticzoo.com/category/robots-in-art/';
        this.data = [];
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    }

    async scrapeArticles() {
        console.log('Starting to scrape cyberneticzoo.com robots-in-art category...');
        
        let currentPage = 1;
        let hasMorePages = true;

        while (hasMorePages && currentPage <= 10) { // Limit to 10 pages to avoid overloading
            const url = currentPage === 1 ? this.baseUrl : `${this.baseUrl}page/${currentPage}/`;
            console.log(`Scraping page ${currentPage}: ${url}`);

            try {
                await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
                
                // Wait for articles to load
                await this.page.waitForSelector('article', { timeout: 10000 });

                const articles = await this.page.evaluate(() => {
                    const articleElements = document.querySelectorAll('article');
                    const articles = [];

                    articleElements.forEach(article => {
                        const titleElement = article.querySelector('h2 a, h1 a, .entry-title a');
                        const linkElement = article.querySelector('h2 a, h1 a, .entry-title a');
                        const imageElement = article.querySelector('img');
                        const excerptElement = article.querySelector('.entry-summary, .entry-content, p');
                        const tagsElements = article.querySelectorAll('.tags a, .tag a, .post-tag');

                        if (titleElement && linkElement) {
                            const title = titleElement.textContent.trim();
                            const link = linkElement.href;
                            const image = imageElement ? imageElement.src : null;
                            const excerpt = excerptElement ? excerptElement.textContent.trim().substring(0, 200) : '';
                            
                            // Extract tags
                            const tags = Array.from(tagsElements).map(tag => tag.textContent.trim());
                            
                            // Extract year from title if possible
                            const yearMatch = title.match(/\b(19|20)\d{2}\b/);
                            const year = yearMatch ? parseInt(yearMatch[0]) : null;

                            articles.push({
                                title,
                                link,
                                image,
                                excerpt,
                                tags,
                                year,
                                id: link.split('/').filter(Boolean).pop() || Math.random().toString(36).substr(2, 9)
                            });
                        }
                    });

                    return articles;
                });

                this.data.push(...articles);
                console.log(`Found ${articles.length} articles on page ${currentPage}`);

                // Check if there's a next page
                const nextPageExists = await this.page.evaluate(() => {
                    const nextLink = document.querySelector('.next.page-numbers, .pagination .next, a[rel="next"]');
                    return !!nextLink;
                });

                if (!nextPageExists || articles.length === 0) {
                    hasMorePages = false;
                } else {
                    currentPage++;
                    // Add delay to be respectful
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

            } catch (error) {
                console.error(`Error scraping page ${currentPage}:`, error.message);
                hasMorePages = false;
            }
        }

        console.log(`Scraping completed. Found ${this.data.length} total articles.`);
    }

    async processData() {
        console.log('Processing scraped data...');
        
        // Create categories/tags for network relationships
        const allTags = new Set();
        
        this.data.forEach(article => {
            // Add some automatic categorization based on title keywords
            const titleLower = article.title.toLowerCase();
            const autoTags = [];
            
            if (titleLower.includes('robot')) autoTags.push('robots');
            if (titleLower.includes('art')) autoTags.push('art');
            if (titleLower.includes('sculpture')) autoTags.push('sculpture');
            if (titleLower.includes('performance')) autoTags.push('performance');
            if (titleLower.includes('interactive')) autoTags.push('interactive');
            if (titleLower.includes('kinetic')) autoTags.push('kinetic');
            if (titleLower.includes('electronic')) autoTags.push('electronic');
            
            // Add decade categorization
            if (article.year) {
                const decade = Math.floor(article.year / 10) * 10;
                autoTags.push(`${decade}s`);
            }

            article.tags = [...new Set([...article.tags, ...autoTags])];
            article.tags.forEach(tag => allTags.add(tag));
        });

        // Create network connections based on shared tags
        this.data.forEach(article => {
            article.connections = this.data
                .filter(other => other.id !== article.id)
                .filter(other => {
                    const sharedTags = article.tags.filter(tag => other.tags.includes(tag));
                    return sharedTags.length > 0;
                })
                .map(other => ({
                    id: other.id,
                    strength: article.tags.filter(tag => other.tags.includes(tag)).length
                }));
        });

        const processedData = {
            nodes: this.data,
            tags: Array.from(allTags),
            stats: {
                totalArticles: this.data.length,
                totalTags: allTags.size,
                averageConnections: this.data.reduce((sum, article) => sum + article.connections.length, 0) / this.data.length
            }
        };

        return processedData;
    }

    async saveData(data) {
        const dataPath = path.join(__dirname, '..', 'data', 'cyberneticzoo-data.json');
        await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
        console.log(`Data saved to ${dataPath}`);
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

async function main() {
    const scraper = new CyberneticZooScraper();
    
    try {
        await scraper.init();
        await scraper.scrapeArticles();
        const processedData = await scraper.processData();
        await scraper.saveData(processedData);
        console.log('Scraping completed successfully!');
    } catch (error) {
        console.error('Scraping failed:', error);
    } finally {
        await scraper.close();
    }
}

if (require.main === module) {
    main();
}

module.exports = CyberneticZooScraper;