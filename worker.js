let privateRssFeedList = [
    'https://securelist.com/feed/',
    'https://modexp.wordpress.com/feed/',
    'https://redcanary.com/feed/',
    'https://www.sentinelone.com/feed/',
    'https://threatpost.com/feed/',
    'https://krebsonsecurity.com/feed/',
    'https://blogs.cisco.com/security/feed',
    'https://blog.xpnsec.com/rss.xml',
    'http://feeds.feedburner.com/eset/blog',
    'https://www.recordedfuture.com/feed'
];

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    let allItems = [];
    for(let feedUrl of privateRssFeedList) {
        try {
            // Fetch the RSS feed
            let response = await fetch(feedUrl)
            let text = await response.text()

            // Get channel title and description
            let channelTitle = text.split('<title>')[1].split('</title>')[0];
            let channelDescription = text.split('<description>')[1].split('</description>')[0];

            // Get items
            let itemSplit = text.split('<item>');
            itemSplit.shift(); // remove first element as it does not represent an item

            let items = itemSplit.map(itemText => {
                let title = itemText.split('<title>')[1].split('</title>')[0];
                let link = itemText.split('<link>')[1].split('</link>')[0];
                
                let descStartIndex = itemText.indexOf('<description><![CDATA[') + '<description><![CDATA['.length;
                let descEndIndex = itemText.indexOf(']]></description>', descStartIndex);
                let description = itemText.slice(descStartIndex, descEndIndex);

                let pubDate = itemText.split('<pubDate>')[1].split('</pubDate>')[0];
                
                return { title, link, description, pubDate, channelTitle, channelDescription };
            });

            // Limit to 5 items per feed
            items = items.slice(0, 5);

            allItems.push(...items);
        } catch (error) {
            console.error(`Failed to process the feed at ${feedUrl}: ${error}`);
        }
    }

    // HTML
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                color: white;
                background-color: black;
            }
        </style>
    </head>
    <body>`;
    
    for(let item of allItems) {
        html += `
        <b>${item.channelTitle}: ${item.title}</b>
        <small>Posted on: ${item.pubDate}</small>
        <p>${item.description} <a href="${item.link}" style="color: skyblue;">Read more</a></p>
        <hr>`;
    }
    
    html += `</body></html>`;
    
    return new Response(html, {
        headers: { 'content-type': 'text/html;charset=UTF-8' },
    });
}