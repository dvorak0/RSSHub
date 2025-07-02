import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/blog', '/'],
    categories: ['blog'],
    example: '/hazyresearch/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['hazyresearch.stanford.edu/blog'],
        },
    ],
    name: 'Hazy Research Blog',
    maintainers: ['dvorak0'],
    handler,
    url: 'https://hazyresearch.stanford.edu/blog',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://hazyresearch.stanford.edu';
    const currentUrl = new URL('blog', rootUrl).href;

    const { data: response } = await got(currentUrl);
    const $ = load(response);

    const items = $('section.Blog_post__BYpPm').toArray().slice(0, limit).map((article) => {
        const el = $(article);

        const title = el.find('h2.Blog_name__UgFzq a').text().trim();
        const link = new URL(el.find('h2.Blog_name__UgFzq a').attr('href'), rootUrl).href;

        const meta = el.find('p.Blog_meta__6TH_f').text().trim();
        const dateText = meta.split('·')[0].trim();
        const authors = el.find('p.Blog_meta__6TH_f span').text().trim();

        return {
            title,
            link,
            pubDate: parseDate(dateText),
            description: `Authors: ${authors}`,
        };
    });

    const siteTitle = $('title').text();
    const author = 'Hazy Research';
    const icon = $('link[rel="icon"]').attr('href');

    return {
        item: finalItems,
        title: `${author} - ${siteTitle}`,
        link: currentUrl,
        language: 'en',
        icon,
        logo: icon,
        subtitle: siteTitle,
        author,
        allowEmpty: true,
    };
}

