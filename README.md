# tdk_college_map

Interactive college map — search rooms, browse buildings and floors.

## Development

```sh
pnpm install
pnpm dev
```

## Build

```sh
pnpm build
```


## Panorama content

The map can show self-hosted spherical test panoramas. Published imagery must
be a full-sphere **equirectangular 360° × 180° image** with a 2:1 aspect ratio;
`4096 × 2048` JPEG is the initial delivery target. A normal horizontal phone
panorama is not a full sphere and must not be labelled as one.

For phone capture, use a camera mode that explicitly exports an equirectangular
photo sphere, or capture overlapping rows from one fixed camera position and
stitch them with [Hugin](https://hugin.sourceforge.io/). Before adding an
image, verify seams, horizon, ceiling/floor coverage, map position, opening
direction, and privacy. Add the image under `public/panoramas/`, then add its
building, plan, SVG coordinates, localized label, and initial yaw/pitch to
`src/data/panoramas.ts`.

The current `placeholder.jpg` is development-only and must be replaced with
approved, privacy-reviewed college imagery before release.

## Credits

Based on and inspired by [aitumap](https://github.com/Yuujiso/aitumap) by Yuujiso.

## License

[MIT](LICENSE)
