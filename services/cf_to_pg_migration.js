import axios from "axios";
import pkg from "pg";
const { Client } = pkg;

const contentfulAPIUrl =
	"https://cdn.contentful.com/spaces/bicmbwrww2bh/entries";
const accessToken = "tNiGC3b1I64hpUi6pqo6CLuLcn-kJGF_l2RFE3NYDqk";
const postgresConfig = {
	connectionString:
		"postgres://default:YLKk26jWtumA@ep-dry-hall-77963246.eu-central-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require",
};

const client = new Client(postgresConfig);

async function fetchDataFromContentful() {
	try {
		const response = await axios.get(contentfulAPIUrl, {
			params: {
				access_token: accessToken,
			},
		});
		return response.data.items;
	} catch (error) {
		console.error("Error fetching data from Contentful:", error);
		throw error;
	}
}

async function migrateDataToPostgres(data) {
	try {
		await client.connect();

		for (const item of data) {
			const { sys, fields } = item;
			const postID = sys.id;
			const postTitle = fields.heading;
			const postImg = fields.imgUrl;
			const postText = fields.postText.content
				.map((p) => p.content[0].value)
				.join("\n\n");

			const query = `
        INSERT INTO posts ("postID", "postTitle", "postImg", "postText")
        VALUES ($1, $2, $3, $4)`;

			await client.query(query, [postID, postTitle, postImg, postText]);
		}
		console.log("Data migration completed successfully.");
	} catch (error) {
		console.error("Error migrating data to PostgreSQL:", error);
	} finally {
		await client.end();
	}
}

async function main() {
	try {
		const contentfulData = await fetchDataFromContentful();
		await migrateDataToPostgres(contentfulData);
	} catch (error) {
		console.error("Error:", error);
	}
}
main();
