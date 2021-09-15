function disposeAll(...lists) {
  lists.forEach((list) => {
    list.forEach((item) => item.dispose());
  });
}

export function materialOnly() {
  return (doc) => {
    const root = doc.getRoot();
    disposeAll(
      root.listNodes(),
      root.listBuffers(),
      root.listCameras(),
      root.listAnimations(),
      root.listAccessors(),
      root.listMeshes(),
      root.listSkins(),
      root.listScenes()
    );
    doc.createBuffer();
  };
}
