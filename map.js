const heat = "./heatVulnerability.geojson";
function map_range(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

function flyToClick(coords) {
  deckgl.setProps({
    initialViewState: {
      longitude: coords[0],
      latitude: coords[1],
      zoom: 15,
      transitionDuration: 500,
      transitionInterpolator: new deck.FlyToInterpolator(),
    },
  });
}

const panel = document.getElementById("panel");
const panelChild = document.querySelector("#panel :nth-child(2)");

const deckgl = new deck.DeckGL({
  container: "map",
  // Set your Mapbox access token here
  mapboxApiAccessToken:
    "pk.eyJ1Ijoibmlrby1kZWxsaWMiLCJhIjoiY2w5c3p5bGx1MDh2eTNvcnVhdG0wYWxkMCJ9.4uQZqVYvQ51iZ64yG8oong",
  // Set your Mapbox style here
  mapStyle: "mapbox://styles/niko-dellic/cl9t226as000x14pr1hgle9az",
  initialViewState: {
    latitude: 39.9526,
    longitude: -75.1652,
    zoom: 12,
    bearing: 0,
    pitch: 0,
  },
  controller: true,

  layers: [
    new deck.GeoJsonLayer({
      id: "heat",
      data: heat,
      // Styles
      filled: true,
      stroke: false,
      getFillColor: (d) => {
        const abs = Math.abs(d.properties.HSI_SCORE);
        const color = map_range(abs, 0, 3.5, 0, 255);

        return d.properties.HSI_SCORE
          ? d.properties.HSI_SCORE < 0
            ? [60, 60, color, 0]
            : [color, 60, 72, color + 66]
          : [0, 0, 0, 0];
      },
      getStrokeColor: [0, 0, 0, 255],
      LineWidthUnits: "meters",
      getLineWidth: 35,
      // Interactive props
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 200],
      onClick: (info) => {
        flyToClick(info.coordinate);

        panelChild.innerHTML = `<strong>Census Tract #${
          info.object.properties.NAME10
        }</strong>
      <br></br>
      HSI SCORE: ${info.object.properties.HSI_SCORE.toFixed(
        2 || "N/A"
      )} <br></br>
      HEI SCORE: ${info.object.properties.HEI_SCORE.toFixed(2 || "N/A")}
      <br></br>
      HVI SCORE: ${info.object.properties.HVI_SCORE.toFixed(2 || "N/A")}
      <br></br>
      Coordinates:
      ${info.coordinate[0].toFixed(3)},
      ${info.coordinate[1].toFixed(3)}`;
        panel.style.opacity = 1;
      },
    }),
  ],
  getTooltip: ({ object }) => {
    return (
      object &&
      `HSI Score: ${
        object.properties.HSI_SCORE
          ? object.properties.HSI_SCORE.toFixed(2)
          : "No Data"
      }`
    );
  },
});
