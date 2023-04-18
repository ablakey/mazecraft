import { TextureName, textures } from "./assets/textures";

export class Assets {
  textures: Record<TextureName, HTMLImageElement>;

  async loadTextures() {
    return Promise.all(
      Object.entries(textures).map(([name, url]) => {
        return new Promise<[TextureName, HTMLImageElement]>((res) => {
          const t = new Image();
          t.onload = () => {
            const result = [name, t] as [TextureName, HTMLImageElement];
            res(result);
          };
          t.src = url;
        });
      })
    ).then((res) => (this.textures = Object.fromEntries(res) as typeof this.textures));
  }
}
