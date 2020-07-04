import {matchAndExtract} from './utils';
import {Processor} from './code-sample';

const EXTRACT_ID = /<!-- #([^ ]+) -->/;
const EXTRACT_DIRECTIVE = /<!-- verifier:(.*) -->/;
const ALT_EXTRACT_ID = /^\/\/ #([^ ]+)$/;
const ALT_EXTRACT_DIRECTIVE = /^\/\/ verifier:(.*)$/;
const TOP_HEADER = /^#{1,3} (.*)$/;

export function extractMarkdownSamples(text: string, p: Processor) {
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const id = matchAndExtract(EXTRACT_ID, line) || matchAndExtract(ALT_EXTRACT_ID, line);
    const header = matchAndExtract(TOP_HEADER, line);
    const directive =
      matchAndExtract(EXTRACT_DIRECTIVE, line) || matchAndExtract(ALT_EXTRACT_DIRECTIVE, line);

    if (id) {
      p.setNextId(id);
    } else if (header) {
      p.setHeader(header);
    } else if (directive) {
      p.setDirective(directive);
    } else {
      if (line.startsWith('```')) {
        const language = line.slice(3);
        p.setNextLanguage(language || null);

        i += 1;
        const startLine = i;
        p.setLineNum(startLine);

        for (; lines[i] !== '```'; i++);

        const content = lines.slice(startLine, i).join('\n');
        p.addSample(content);
      }

      p.resetWithNormalLine();
    }
  }
}
