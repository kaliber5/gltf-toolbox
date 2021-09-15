// Shamelessly stolen from https://github.com/donmccurdy/glTF-Transform/pull/148/files#diff-7d271f1ad53a2956266ef34de63601f1ea5205eab905c549ac8c66c4a17076f0
export function getTextureSlots(doc, texture) {
  return doc
    .getGraph()
    .getLinks()
    .filter((link) => link.getChild() === texture)
    .map((link) => link.getName())
    .filter((slot) => slot !== 'texture');
}
