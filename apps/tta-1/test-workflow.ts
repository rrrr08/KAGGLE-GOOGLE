// Simple test script to verify the TTA-1 system works
// Run with: node --loader ts-node/esm test-workflow.ts
// Or use tsx: npx tsx test-workflow.ts

import { readFileSync } from "fs";
import { Orchestrator } from "./lib/orchestrator/workflow";
import { parseCSV } from "./lib/utils/csv-parser";

async function testWorkflow() {
    console.log("🚀 Testing TTA-1 Workflow...\n");

    // Read sample CSV
    const csvContent = readFileSync("./public/sample.csv", "utf-8");
    console.log("📄 Loaded sample CSV");

    // Parse CSV
    const parseResult = parseCSV(csvContent);
    if (!parseResult.valid) {
        console.error("❌ CSV parsing failed:", parseResult.errors);
        return;
    }
    console.log(`✅ Parsed ${parseResult.data.length} rows\n`);

    // Initial lesson (intentionally weak)
    const initialLesson = `
Today we will learn about solving equations.

An equation is a mathematical statement that two expressions are equal.

Example: x + 5 = 10

To solve, subtract 5 from both sides: x = 5

Practice: Solve x + 3 = 7
  `.trim();

    console.log("📝 Initial Lesson:");
    console.log(initialLesson);
    console.log("\n" + "=".repeat(60) + "\n");

    // Run workflow
    const orchestrator = new Orchestrator();

    try {
        const result = await orchestrator.runWorkflow(
            parseResult.data,
            initialLesson,
            "7A",
            "T1"
        );

        console.log("\n" + "=".repeat(60));
        console.log("📊 RESULTS");
        console.log("=".repeat(60) + "\n");

        console.log(`Run ID: ${result.run_id}`);
        console.log(`Final Score: ${result.final_score}/100`);
        console.log(`Passed: ${result.passed ? "✅ YES" : "❌ NO"}`);
        console.log(`Iterations: ${result.history.length}\n`);

        console.log("📈 Iteration History:");
        result.history.forEach((h) => {
            console.log(`  Iteration ${h.iter}: Score ${h.score}`);
        });

        console.log("\n🎯 Agent A Summary:");
        console.log(`  Class Average: ${result.agent_a_summary.class_average.toFixed(1)}%`);
        console.log(`  Weakest Topics:`);
        result.agent_a_summary.weakest_topics.slice(0, 3).forEach((t) => {
            console.log(`    - ${t.topic}: ${t.avg.toFixed(1)}% (${(t.pct_below * 100).toFixed(0)}% below threshold)`);
        });
        console.log(`  At-Risk Students: ${result.agent_a_summary.at_risk_students.length}`);

        console.log("\n📝 Final Improved Lesson:");
        console.log("=".repeat(60));
        console.log(result.final_draft);
        console.log("=".repeat(60));

    } catch (error) {
        console.error("\n❌ Workflow failed:", error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
    }
}

testWorkflow();
