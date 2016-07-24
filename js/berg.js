function createIsland ( width, height ) {
    var island = new THREE.Object3D();

    var radius = Math.min( width, height );

    // Get our noise generators for the top and bottom of the island. Double
    // width / height as these specify radius not diameter.
    var topNoise = new Noise( 2 * width, 2 * height );
    var botNoise = new Noise( 2 * width, 2 * height );

    // Create and scale island geometry to be ellipsoid
    var islandGeo = new THREE.IcosahedronGeometry( radius, 3 );
    islandGeo.scale( width / radius, height / radius, 1 );

    // Find the highest point on the island while we are doing the noising pass
    var max = new THREE.Vector3();
    islandGeo.vertices.map( function ( vertex ) {
        // Use bottom noise generator, with a little smoother scale ( 200 )
        if ( vertex.z < 0 ) {
            // This function is a bit magic, but it works. Causes exponential
            // spiking of heights to get nicer topography.
            // Width & height are added to make values non-negative.
            vertex.z *= 0.08 * Math.exp(  botNoise.turbulence( vertex.x + width, vertex.y + height, 200 ) );

        // Use top noies generator, we don't care if it's noisier as it will be squashed later
        } else {
            vertex.z *= 0.08 * Math.exp(  topNoise.turbulence( vertex.x + width, vertex.y + height, 100 ) );

            // Keep track of max value
            if ( vertex.z > max.z )
                max = vertex;
        }
    } );

    // Hulk squash
    max = max.clone();
    islandGeo.vertices.map( function ( vertex ) {
        // Use inverse sigmoid function to squash values farther away from peak, but still keep a smooth descent.
        if ( vertex.z > 0 ) {
            var dist = vertex.distanceTo( max );
            vertex.z *= 1 / ( 1 + Math.exp( 12 * dist / (1.2 * radius)  - 4))

        // Displace lower half a little bit as the squashing will cause a pile up of vertices. Makes it look more natural.
        } else {
            vertex.z -= 3;
        }

        // Bend all vertices down on a parabola away from the island's center.
        vertex.perturb( 0.5 );
        vertex.z -= 0.003 * (Math.pow( vertex.x, 2 ) + Math.pow( vertex.y, 2 ));
    } );

    // Create island base feature
    island.addFeatureGeometry( 'base', islandGeo );
    island.addFeatureMaterialP( 'base', { color : 0x566053,
                                          shading : THREE.FlatShading,
                                          shininess : 10,
                                          refractionRatio : 0.1 } );

    // This extrudes grass on the flat top of the island - But doesn't go up too high so mountains stay bare.
    island.addFeatureGeometry( 'grass', extrudeFaces( islandGeo, 0.8, 1.0, -20, 10, 0.01 ) );
    // This covers the lower part of the island so we get some grass overhang.
    island.addFeatureGeometry( 'grass', extrudeFaces( islandGeo, -1, 1, -10, 0, 0.01 ) );

    // Distort the grass so we can let some sand features come through.
    var grass = island.getFeature( 'grass' ).geometry;
    grass.vertices.map( function ( vertex ) {
        var m = new THREE.Vector3( max.x, max.y, vertex.z );
        var e = new THREE.Vector3( max.x, max.y, vertex.z );
    } );


    island.addFeatureMaterialP( 'grass', { color : 0x73f773,
                                           shading : THREE.FlatShading,
                                           shininess : 0,
                                           refractionRatio : 0.1 } );

    // Create snow caps - Only place snow on somewhat flat mountain faces above z = 20.
    island.addFeatureGeometry( 'snow', extrudeFaces( islandGeo, 0.3, 1, 20, 100, 0.2 ) );
    island.addFeatureMaterialP( 'snow', { color : 0xffffff,
                                          shading : THREE.FlatShading,
                                          emissive : 0xaaaaaa,
                                          shininess : 70,
                                          refractionRatio : 0.7 } );

    island.bufferizeFeature( 'base' );
    island.bufferizeFeature( 'grass' );
    island.bufferizeFeature( 'snow' );

    island.generateFeatures();

    // Gently oscillate
    island.addUpdateCallback( function( obj ) {
        // obj.rotateZ( 0.001 );
        obj.position.z = Math.sin( 0.005 * tick ) * 3;
        obj.rotation.x = Math.sin( 0.005 * tick ) * 0.03;
        obj.rotation.y = Math.cos( 0.005 * tick ) * 0.03;
    } );

    island.addToObject( scene );

    // Set environmental data.
    island.userData.width = 2 * width;
    island.userData.height = 2 * height;

    environment.island = island;
    environment.width = width * 2;
    environment.height = height * 2;
}

function extrudeFaces( geometry, dMin, dMax, zMin, zMax, offset ) {

    geometry.computeFaceNormals();

    var extrude = new THREE.Geometry();

    extrude.vertices = new Array( geometry.vertices.length );
    for ( var i = 0; i < geometry.vertices.length; ++i )
        extrude.vertices[ i ] = geometry.vertices[ i ].clone();

    var mossAngle = new THREE.Vector3( 0, 0, 1 );

    for ( var i = 0; i < geometry.faces.length; i++ ) {
        var face = geometry.faces[i];

        var dot = face.normal.dot( mossAngle );
        if ( dot < dMax && dot > dMin ) {
            var va = extrude.vertices[ face.a ];
            var vb = extrude.vertices[ face.b ];
            var vc = extrude.vertices[ face.c ];

            var z = ( va.z + vb.z + vc.z );
            if ( z < zMax * 3 && z > zMin * 3 ) {
                var normal = face.normal.multiplyScalar( offset );
                va.add( normal );
                vb.add( normal );
                vc.add( normal );
                extrude.faces.push(face.clone());
            }
        }
    }

    return extrude;

}
