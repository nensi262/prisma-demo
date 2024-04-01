import { client } from "@/lib/contentful";
import { Entry } from "contentful";
import { GetServerSidePropsContext } from "next";

async function generateSiteMap() {
  const domain = "https://www.moove.house";

  const blog = await client.getEntries({
    content_type: "post",
    limit: 100,
  });

  const terms = await client.getEntries({
    content_type: "term",
    limit: 1000,
  });

  const staticPages = ["property-terms", "blog", "about", "contact"];

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${domain}</loc>
       <priority>1.0</priority>
     </url>
      ${staticPages
        .map((slug) => {
          return `
        <url>
            <loc>${`${domain}/${slug}`}</loc>
        </url>
      `;
        })
        .join("")}
     ${terms.items
       .map(({ fields }) => {
         return `
       <url>
           <loc>${`${domain}/property-terms/${fields.slug}`}</loc>
       </url>
     `;
       })
       .join("")}
       ${blog.items
         .map(({ fields }) => {
           return `
       <url>
           <loc>${`${domain}/blog/${(fields.category as Entry).fields.slug}/${
             fields.slug
           }`}</loc>
       </url>
     `;
         })
         .join("")}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  const sitemap = await generateSiteMap();

  res.setHeader("Content-Type", "text/xml");
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
