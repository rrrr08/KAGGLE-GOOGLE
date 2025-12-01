import * as fs from "fs";
try {
    fs.writeFileSync("test.log", "Hello world");
    console.log("File written successfully");
} catch (e) {
    console.error("Write failed:", e);
}
