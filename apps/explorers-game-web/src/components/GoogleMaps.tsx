import { assert } from '@explorers-club/utils';
import { ThreeJSOverlayView, WORLD_SIZE } from '@googlemaps/three';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three';

const mapOptions = {
  tilt: 0,
  heading: 0,
  zoom: 18,
  center: { lat: 35.6594945, lng: 139.6999859 },
  mapId: '15431d2b469f209e',
  // disable interactions due to animation loop and moveCamera
  disableDefaultUI: true,
  gestureHandling: 'none',
  keyboardShortcuts: false,
};
// const GoogleMapsModel = () => {
//   const gltf = useLoader(
//     GLTFLoader,
//     'https://raw.githubusercontent.com/googlemaps/js-samples/main/assets/pin.gltf'
//   );
//   const [tilt, setTilt] = useState(mapOptions.tilt);
//   const [heading, setHeading] = useState(mapOptions.heading);
//   const [zoom, setZoom] = useState(mapOptions.zoom);

//   useFrame(() => {
//     if (tilt < 67.5) {
//       setTilt(tilt + 0.5);
//     } else if (heading <= 360) {
//       setHeading(heading + 0.2);
//       setZoom(zoom - 0.0005);
//     }
//   });

//   useEffect(() => {
//     if (window.map) {
//       window.map.moveCamera({ tilt, heading, zoom });
//     }
//   }, [tilt, heading, zoom]);

//   return (
//     <primitive
//       object={gltf.scene}
//       scale={[10, 10, 10]}
//       rotation={[Math.PI / 2, 0, 0]}
//     />
//   );
// };

export const GoogleMaps = () => {
  const { scene } = useThree();

  useEffect(() => {
    (async () => {
      const loader = new Loader({
        apiKey: 'AIzaSyAFzFSyGMTtinND1WcFe2Q614B8vEncmW0',
        version: 'beta',
      });

      loader.load().then(async () => {
        const { Map } = (await google.maps.importLibrary(
          'maps'
        )) as google.maps.MapsLibrary;
        const mapDiv = document.getElementById('map');
        assert(mapDiv, 'expected mapDiv but undefined');
        const map = new Map(mapDiv, {
          center: { lat: -34.397, lng: 150.644 },
          zoom: 8,
        });
        const overlay = new ThreeJSOverlayView({
          map,
          scene,
          anchor: { ...mapOptions.center, altitude: 100 },
        });

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
        directionalLight.position.set(0, 10, 50);
        scene.add(directionalLight);

        // scene.add(overlay as any);
        console.log(overlay);

        // state.scene = overlay.scene;

        let tilt = 0;
        let heading = 0;
        let zoom = 18;

        const loop = () => {
          if (tilt < 67.5) {
            tilt = tilt + 0.5;
          } else if (heading <= 360) {
            heading = heading + 0.2;
            zoom = zoom - 0.0005;
          } else {
            return;
          }
          //   console.log({ tilt, heading, zoom });

          map.moveCamera({
            tilt,
            heading,
            zoom,
          });
          requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
      });
    })();
  }, [scene]);

  return null;
};
