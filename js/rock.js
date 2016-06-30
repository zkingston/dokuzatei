function RockClusterFactory( RockGeometry, width, height, depth ) {
    var x = width;
    var y = height;
    var z = depth;

    var rocks = new THREE.Object3D();
    rocks.addFeatureGeometry( 'rocks', RockGeometry( x, y, z ) );

    var chance = 0.3;

    while ( Math.random() > chance && x > 3 && y > 3 ) {
        for ( var i = 0; i < 2; i++ ) {
            x -= Math.random() * ( x - 1 );
            y -= Math.random() * ( y - 1 );
            z -= Math.random() * ( z - 1 );

            var newRock = RockGeometry( x, y, z );
            newRock.scale( Math.random() / 2 + 0.4, 1, 1 );

            newRock.translate( randOffset( 0, 2 * width ),
                               randOffset( 0, 2 * height ),
                               -( depth - z ) / 2 );

            newRock.rotateZ( Math.random() * Math.PI );
            rocks.addFeatureGeometry( 'rocks', newRock );
        }

        chance += 0.2;
    }

    rocks.addFeatureMaterialP( 'rocks', { color : 0x505050,
                                          shading : THREE.FlatShading,
                                          refractionRatio : 0.1 } )
    rocks.generateFeatures();
    return rocks;
}

function MossDecorator( rock, threshold ) {

    var mossyRock = new THREE.Group();
    mossyRock.add( rock );

    var mossGeo = rock.geometry.clone();
    mossGeo.computeFaceNormals();

    var mossAngle = new THREE.Vector3( 0, 1, 1 );

    for ( var i = 0; i < mossGeo.faces.length; i++ ) {
        var face = mossGeo.faces[i];

        if ( face.normal.dot( mossAngle ) < threshold ) {
            console.log (face.normal.dot( mossAngle ) );
            var va = mossGeo.vertices[face.a];
            var vb = mossGeo.vertices[face.b];
            var vc = mossGeo.vertices[face.c];

            va.z -= 0.1;
            vb.z -= 0.1;
            vc.z -= 0.1;
        }
    }

    var mossMat = new THREE.MeshPhongMaterial( { color : 0x77d97e,
                                                 shading : THREE.FlatShading,
                                                 shininess : 30,
                                                 refractionRatio : 0.0 } );

    var moss = new THREE.Mesh( mossGeo, mossMat );
    moss.position.x = rock.position.x;
    moss.position.y = rock.position.y;
    moss.position.z = rock.position.z;
    mossyRock.add( moss );

    return mossyRock;

}

function SpireRockGeometry( width, height, depth ) {
    var cfg = { t_rad_range : { min : 0.4,
                                max : 0.8 },
                r_seg_range : { min : 5,
                                max : 8 },
                h_seg_range : { min : 5,
                                max : 10 },
                rotate      : { min : -Math.PI / 8,
                                max : Math.PI / 8 },
                vector_mag  : 0.3,
                top_perturb : 0.5,
                top_offset  : 0.3 };

    var diameter = Math.max( width, height );
    var b_rad = diameter / 2;
    var t_rad = continuousUniform( cfg.t_rad_range.min,
                                   cfg.t_rad_range.max ) * b_rad;

    var r_seg = discreteUniform( cfg.r_seg_range.min,
                                 cfg.r_seg_range.max );

    var h_seg = discreteUniform( cfg.h_seg_range.min,
                                 cfg.h_seg_range.max );

    var geometry = new THREE.ClosedCylinderGeometry(
        t_rad, b_rad, depth, r_seg, h_seg ).rotateX( Math.PI / 2 );

    var half_depth = depth / 2;
    geometry.vertices.map( function ( vertex ) {
        if ( Math.abs( vertex.z ) === half_depth ) {
            var s = vertex.z.sign();
            var r = continuousUniform( 0, cfg.top_perturb );
            if ( Math.abs( vertex.x ) < 0.001 && Math.abs( vertex.y ) < 0.001 ) {
                vertex.z += s * ( r + cfg.top_offset );
            } else {
                vertex.z += s * r;
            }
        }
    } );

    var rotate = continuousUniform( cfg.rotate.min, cfg.rotate.max );
    geometry.rotateX( rotate );

    var axis_vectors = [];
    var num_vectors = h_seg;
    for ( var v = 0; v < num_vectors; v++ ) {
        var r = continuousUniform( -1, 1 );
        var ar = Math.abs( r );
        axis_vectors.push( new THREE.Vector3( continuousUniform( -ar, ar ) * b_rad,
                                              continuousUniform( -ar, ar ) * b_rad,
                                              r * half_depth ) );
    }

    geometry.vertices.map( function ( vertex ) {
        var internal = vertex.closest( axis_vectors ).clone();
        vertex.sub( internal.multiplyScalar( cfg.vector_mag ) );
    } );

    geometry.scale( width / diameter, height / diameter, 1 );
    geometry.rotateX( -rotate );

    return geometry;
}
