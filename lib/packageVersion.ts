import { readFileSync } from 'fs';
import { join } from 'path';

export function getPackageVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}
