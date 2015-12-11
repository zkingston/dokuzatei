var lanternIntensity = 0.5;

function updateLanterns() {
    var lanterns = environment.lanternLights;

    for ( var i = 0; i < lanterns.length; i++ ) {
        var light = lanterns[i];
        light.intensity = lanternIntensity + 0.03 * Math.sin( ( light.wave + tick + Math.random() * 150 ) * 0.15 );
    }

}

function lanternFactory( width, height, depth ) {

    if ( !environment.lanterns ) {
        environment.lanterns = []
        environment.lanternLights = []
    }

    var lantern = new THREE.Group();

    var lightContainer = boxFactory( width / 2,
                                     height / 2,
                                     depth / 2,
                                     { transparent : true,
                                       opacity : 0.7,
                                       color : 0xff9900,
                                       side : THREE.DoubleSide,
                                       shading : THREE.FlatShading,
                                       shininess : 100,
                                       emissive : 0xff9900
                                     } );

    var lightBase = boxFactory( 3 * width / 4,
                                3 * height / 4,
                                depth / 8 );

    var lightTop = lightBase.clone();

    lightTop.position.z += depth / 4;
    lightBase.position.z -= depth / 4;

    var lightBracket1 = boxFactory( width / 16,
                                    height / 16,
                                    depth / 2 );
    lightBracket1.position.x += width / 4;
    lightBracket1.position.y += height / 4;

    var lightBracket2 = lightBracket1.clone();
    lightBracket2.position.x -= width / 2;

    var lightBracket3 = lightBracket1.clone();
    lightBracket3.position.y -= height / 2;

    var lightBracket4 = lightBracket2.clone();
    lightBracket4.position.y -= height / 2;

    var lightPole = boxFactory( width / 8,
                                height / 8,
                                depth );
    lightPole.position.z -= 3 * depth / 4;

    var lightGeo = mergeMeshGeometry( [ lightTop,
                                        lightBase,
                                        lightBracket1,
                                        lightBracket2,
                                        lightBracket3,
                                        lightBracket4,
                                        lightPole ] );

    var lightMaterial = new THREE.MeshPhongMaterial( { color : 0x996633,
                                                       shading : THREE.FlatShading,
                                                       shininess : 5,
                                                       refractionRatio : 0.1 } );
    var lightHolder = new THREE.Mesh( lightGeo, lightMaterial );


    var light = new THREE.PointLight( 0xff9900, lanternIntensity, 50 );
    light.wave = Math.random() * 100;

    lantern.add( light );
    lantern.add( lightHolder );
    lantern.add( lightContainer );

    lantern.traverse( function( object ) {

        if ( object instanceof THREE.Mesh ) {
            object.castShadow = true;
            object.receiveShadow = true;
        }

    } );

    environment.lanterns.push( lantern );
    environment.lanternLights.push( light );

    return lantern;

}
