/* Removed: fine-tuning script decommissioned.
import 'dotenv/config';
import OpenAI from 'openai';
import fs from 'node:fs';

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Missing OPENAI_API_KEY in env');
    process.exit(1);
  }
  const client = new OpenAI({ apiKey });

  const trainPath = process.argv[2] || 'data/fine-tune/train.jsonl';
  const valPath = process.argv[3] || 'data/fine-tune/val.jsonl';
  const baseModel = process.argv[4] || 'gpt-4o-mini-2024-07-18';
  const suffix = process.argv[5] || 'resume-rewriter';

  if (!fs.existsSync(trainPath)) throw new Error(`Missing ${trainPath}`);
  if (!fs.existsSync(valPath)) throw new Error(`Missing ${valPath}`);

  console.log('Uploading files...');
  const trainFile = await client.files.create({ file: fs.createReadStream(trainPath), purpose: 'fine-tune' });
  const valFile = await client.files.create({ file: fs.createReadStream(valPath), purpose: 'fine-tune' });

  console.log('Creating fine-tune job...');
  const job = await client.fineTuning.jobs.create({
    model: baseModel,
    training_file: trainFile.id,
    validation_file: valFile.id,
    suffix,
    hyperparameters: { n_epochs: 3 },
  });

  console.log('Fine-tune job created:', job.id);
}

main().catch((e) => { console.error(e); process.exit(1); });
*/
