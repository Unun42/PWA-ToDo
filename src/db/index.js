import { sqliteDriver } from "./sqliteDriver.js";

let driver;

if (process.env.TURSO_DATABASE_URL) {
    const { tursoDriver } = await import("./tursoDriver.js");
    driver = tursoDriver;
} else {
    driver = sqliteDriver;
}

console.log(`[db] using driver: ${driver.name}`);

export default driver;
