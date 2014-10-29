// Process ~superscript~

'use strict';

module.exports = function sup(state, silent) {
  var found,
      stack,
      max = state.posMax,
      start = state.pos,
      lastChar,
      nextChar;

  if (state.src.charCodeAt(start) !== 0x5E/* ^ */) { return false; }
  if (start + 2 >= max) { return false; }
  if (state.level >= state.options.maxNesting) { return false; }

  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;
  nextChar = state.src.charCodeAt(start + 2);

  if (nextChar === 0x20 || nextChar === 0x0A) { return false; }

  state.pos = start + 1;
  stack = 1;

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === 0x5E/* ^ */) {
      lastChar = state.src.charCodeAt(state.pos - 1);
      nextChar = state.pos + 1 < max ? state.src.charCodeAt(state.pos + 1) : -1;
      if (nextChar !== 0x5E/* ^ */ && lastChar !== 0x5E/* ^ */) {
        if (lastChar !== 0x20 && lastChar !== 0x0A) {
          // closing '^'
          stack--;
        } else if (nextChar !== 0x20 && nextChar !== 0x0A) {
          // opening '^'
          stack++;
        } // else {
          //  // standalone ' ^ ' indented with spaces
          //}
        if (stack <= 0) {
          found = true;
          break;
        }
      }
    }

    state.parser.skipToken(state);
  }

  if (!found) {
    // parser failed to find ending tag, so it's not valid emphasis
    state.pos = start;
    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + 1;

  if (!silent) {
    state.push({ type: 'sup_open', level: state.level++ });
    state.parser.tokenize(state);
    state.push({ type: 'sup_close', level: --state.level });
  }

  state.pos = state.posMax + 1;
  state.posMax = max;
  return true;
};