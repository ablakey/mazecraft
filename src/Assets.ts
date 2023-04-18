import { TextureName, textures } from "./assets/textures";

export class Assets {
  textures: Record<TextureName, ImageData>;

  async loadTextures() {
    const tex: Partial<Record<string, ImageData>> = {};
    for (const [name, url] of Object.entries(textures)) {
      tex[name] = await this.urlToImageData(url);
    }

    this.textures = tex as typeof this.textures;
    console.log(this.textures);
  }

  async urlToImageData(url: string) {
    return new Promise<ImageData>((res) => {
      const img = new Image();
      img.onload = () => {
        const canvas = new OffscreenCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        res(imageData);
      };
      img.src = url;
    });
  }
}
