import { assert } from '@explorers-club/utils';
import { useLoader, useThree } from '@react-three/fiber';
import { useStore } from '@nanostores/react';
import { FC, ReactNode, useContext, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three';
import { ThreeJSOverlayView } from '@googlemaps/three';
import { GLTFLoader } from 'three-stdlib';
import { WorldContext } from '@context/WorldProvider';
import { ConnectionContext } from './ApplicationProvider';
import { entitiesById } from 'libs/api/src/server/state';

export const GoogleMaps: FC<{ children?: ReactNode }> = ({ children }) => {
  //   const [scene1, setScene] = useState<THREE.Scene | null>(null);
  const { scene } = useThree();
  const gltf = useLoader(GLTFLoader, '/coin.glb');
  const { entityStoreRegistry } = useContext(WorldContext);
  // const cc = useContext(ConnectionContext);
  // const { myConnectionId } = useContext(ConnectionContext);
  // const myConnnectionEntity = useStore(entityStoreRegistry.myConnectionEntity);
  // console.log({ myConnnectionEntity });
  // console.log({ world, e: entityStoreRegistry.myConnectionEntity });
  // const entity = (await waitForCondition<ConnectionEntity>(
  //   world,
  //   entitiesById,
  //   connectionId,
  //   (entity) => entity.states.Initialized === 'True'
  // )) as InitializedConnectionEntity;

  useEffect(() => {
    (async () => {
      const loader = new Loader({
        apiKey: 'AIzaSyAFzFSyGMTtinND1WcFe2Q614B8vEncmW0',
        version: 'beta',
      });

      const mapOptions = {
        tilt: 0,
        heading: 0,
        zoom: 10,
        center: { lat: 34.0094435, lng: -118.4970725 },
        mapId: '71e089bbf1526a73',
        disableDefaultUI: true,
        gestureHandling: 'none',
        keyboardShortcuts: false,
      };

      loader.load().then(async () => {
        const { Map } = (await google.maps.importLibrary(
          'maps'
        )) as google.maps.MapsLibrary;
        const mapDiv = document.getElementById('map');
        assert(mapDiv, 'expected mapDiv but undefined');
        const map = new Map(mapDiv, mapOptions);

        new ThreeJSOverlayView({
          scene,
          map,
          upAxis: 'Y',
          anchor: mapOptions.center,
        });

        const initializeHome = () => {
          console.log('iniitializing');

          entityStoreRegistry.myConnectionEntity.subscribe((entity) => {
            if (!entity) {
              console.warn("expected entity but didn't exist");
              return;
            }

            if (!entity.currentGeolocation) {
              console.warn("expected geo location but didn't exist");
              return;
            }

            console.log(entity.currentGeolocation);
            map.moveCamera({
              center: new google.maps.LatLng(
                entity.currentGeolocation.coords.latitude,
                entity.currentGeolocation.coords.longitude
              ),
            });
          });
        };

        // const overlay = new ThreeJSOverlayView({
        //   anchor: { lat: 37.7793, lng: -122.4192, altitude: 0 },
        //   upAxis: 'Y',
        // });
        // setScene(overlay.scene);

        // Create a box mesh
        // const box = new THREE.Mesh(
        //   new THREE.BoxGeometry(100, 200, 500),
        //   new THREE.MeshMatcapMaterial()
        // );
        // overlay.requestRedraw();

        // set position at center of map
        // const pos = overlay.latLngAltitudeToVector3(mapOptions.center);
        // box.position.copy(pos);

        // set position vertically
        // box.position.z = 25;

        // add box mesh to the scene
        // overlay.scene.add(box);

        let tilt = 0;
        let heading = 0;
        let zoom = 19;

        const loop = async () => {
          if (tilt < 67.5) {
            tilt = tilt + 0.5;
          } else if (heading <= 360) {
            heading = heading + 0.2;
            zoom = zoom - 0.0005;
          } else {
            initializeHome();
            // const entity = (await waitForCondition<ConnectionEntity>(
            //   world,
            //   entitiesById,
            //   connectionId,
            //   (entity) => entity.states.Initialized === 'True'
            // )) as InitializedConnectionEntity;
            return;
          }
          //   console.log({ tilt, heading, zoom });
          // map.setCenter()

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
  }, []);

  return (
    <primitive
      object={gltf.scene}
      scale={[100, 100, 100]}
      position={[0, 50, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    />
  );

  //   return (
  //     <>
  //       {/* This mesh receives the render-targets texture and draws it onto a plane */}
  //       {/* <mesh scale={scale} ref={ref} {...props}>
  //         <planeGeometry />
  //         <meshBasicMaterial map={fbo.texture} map-encoding={THREE.sRGBEncoding} transparent />
  //       </mesh> */}
  //       {/* A portal by default now has its own state, separate from the root state.
  //           The third argument to createPortal allows you to override parts of it, in here for example
  //           we place our own camera and override the events definition with a lower proprity than
  //           the previous layer, and our custom compute function. */}
  //       {createPortal(children, scene1)}
  //     </>
  //   );
};
