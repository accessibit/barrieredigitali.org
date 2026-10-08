import { db, deleteE2eReports } from "./helpers";

export default async function teardown() {
  await deleteE2eReports();
  await db().end();
}
