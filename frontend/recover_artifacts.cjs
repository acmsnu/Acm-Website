const fs = require('fs');

const transcriptPath = '/home/dionysus/.gemini/antigravity-ide/brain/8ea58f58-1b0d-43ad-aa71-9403a0fc2102/.system_generated/logs/transcript_full.jsonl';
const brainDir = '/home/dionysus/.gemini/antigravity-ide/brain/8ea58f58-1b0d-43ad-aa71-9403a0fc2102';

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);

let latestPlan = null;
let latestWalkthrough = null;

for (const line of lines) {
  const step = JSON.parse(line);
  if (step.step_index > 1800) continue; // Skip the performance optimization steps
  
  if (step.tool_calls) {
    for (const call of step.tool_calls) {
      if (call.name === 'write_to_file') {
        if (call.args.TargetFile && call.args.TargetFile.includes('implementation_plan.md')) {
          latestPlan = call.args.CodeContent;
        }
        if (call.args.TargetFile && call.args.TargetFile.includes('walkthrough.md')) {
          latestWalkthrough = call.args.CodeContent;
        }
      }
      
      // If we used replace_file_content or multi_replace_file_content on them, we might need to apply diffs,
      // but usually the plan/walkthrough are completely rewritten using write_to_file.
      // Let's assume write_to_file is how they were made.
    }
  }
}

if (latestPlan) {
  fs.writeFileSync(`${brainDir}/original_plan.md`, latestPlan);
  console.log("Recovered original_plan.md");
}

if (latestWalkthrough) {
  fs.writeFileSync(`${brainDir}/original_walkthrough.md`, latestWalkthrough);
  console.log("Recovered original_walkthrough.md");
}
