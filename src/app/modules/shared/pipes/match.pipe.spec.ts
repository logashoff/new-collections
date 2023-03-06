import { MatchPipe } from './match.pipe';

describe('MatchPipe', () => {
  it('should parse highlighted string', () => {
    const pipe = new MatchPipe();

    let res = pipe.transform('The quick brown fox jumps over the lazy dog', [
      [4, 8],
      [20, 24],
    ]);

    expect(res).toBe('The <mark>quick</mark> brown fox <mark>jumps</mark> over the lazy dog');

    res = pipe.transform('<strong>html</strong><mark>test</mark>', [
      [0, 11],
      [27, 30],
    ]);
    
    expect(res).toBe('<mark>&lt;strong&gt;html</mark>&lt;/strong&gt;&lt;mark&gt;<mark>test</mark>&lt;/mark&gt;');
  });
});
