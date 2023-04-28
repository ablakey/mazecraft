import { TextureName, textures } from "../assets/textures";

export class Assets {
  textures: Record<TextureName, HTMLImageElement>;

  async loadTextures() {
    const tex: Partial<Record<string, HTMLImageElement>> = {};

    for (const [name, url] of Object.entries(textures)) {
      tex[name] = await this.urlToImage(url);
    }

    this.textures = tex as typeof this.textures;
  }

  async urlToImage(url: string) {
    return new Promise<HTMLImageElement>((res) => {
      const img = new Image();
      img.onload = () => {
        res(img);
      };
      img.src = url;
    });
  }
}
