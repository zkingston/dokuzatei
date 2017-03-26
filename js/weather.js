function WeatherEngine()
{
    this.atmoData = {
      season : 0, // 0-3 TODO: perhaps make this location based. for our southern hemisphere clientele
      time : 2, // 0-24
      weather : "rain", //[clear, rain, clouds, ice]
      temp : 69  // Murica units
    }; //Random or weather based.

    this.clearSkyColors = [
      0xaaccff, //light
      0x88aee8,
      0x4372b7,
      0x244f91,
      0x123568,
      0x001331  //dark
    ];

    this.cloudySkyColors = [
      0x45689b, //light
      0x3c5b89,
      0x213d68,
      0x19355e,
      0x11305e,
      0x001331  //dark
    ];

    this.skyColor = function(hour,sky){
      var bucket = round(sky.length * abs(hour - 12)/12);
      if(bucket == sky.length){bucket-=1;}
      return sky[bucket];
    }

    this.setAtmoData = function(){
      if (weathermode == true){
        var date = new Date();
        this.atmoData.dateObject = date;
        this.atmoData.time = date.getHours();
        //TODO LITERALLY EVERTHING ELSE
      }
    }



    this.thundergodsOracle = function(){

        this.setAtmoData();
        var hour = this.atmoData.time


        var atmo = this.atmoData;



        if(atmo.weather == "clear"){
          var color = this.skyColor(hour,this.clearSkyColors)
          renderer.setClearColor( color, 1 );
          scene.fog = new THREE.FogExp2( color, 0.0025 );
          environment.lamp = new THREE.DirectionalLight( 0xdddddd, 0.5 );

        }

        if(atmo.weather == "rain"){
          var color = this.skyColor(hour,this.cloudySkyColors)
          renderer.setClearColor( color, 1 );
          environment.lamp = new THREE.DirectionalLight( 0xdddddd, 0.5 );
          var rain = this.generateRain();
          environment.rain = rain;
          scene.add(rain);
          scene.fog = new THREE.FogExp2( color, 0.005 );
        }


        var night = false;
        if((hour >= 0 && hour <= 4)||(hour <= 24 && hour >= 20)){night = true;}

        if (night){
              //if (!environment.stars) {
                  var stars = createStars();
                  environment.stars = stars;
                  scene.add(stars);
                  environment.lamp = new THREE.DirectionalLight( 0x292929, 0.5 )

        }else{
          scene.remove(environment.stars);
        }


        //   nightMode = false;
        //
        // if (nightMode) {
        //     scene.fog = new THREE.FogExp2( 0x001331, 0.0025 );
        //     renderer.setClearColor( 0x001331, 1 );
        //     environment.lamp = new THREE.DirectionalLight( 0x292929, 0.5 );
        //     if (typeof environment.stars === 'undefined') {
        //         stars = createStars();
        //         environment.stars = stars;
        //         scene.add(stars);
        //     }
        //     else {
        //         scene.add(environment.stars);
        //     }
        // }
        // else {
        //     scene.fog = new THREE.FogExp2( 0xaaccff, 0.005 );
        //     renderer.setClearColor( 0xaaccff, 1 );
        //     environment.lamp = new THREE.DirectionalLight( 0xdddddd, 0.5 );
        // }
        //
    }


    this.generateRain = function()
    {

      var rain = new THREE.Object3D();
        // create the particle variables
        var particleCount = 1000,
            particles = new THREE.Geometry(),
            pMaterial = new THREE.PointsMaterial({
              color: 0x435682,
              //map: THREE.ImageUtils.loadTexture("images/particle.png"),
              //color: 0xffffff,
              size: 0.5,
              //blending: THREE.AdditiveBlending,
              //transparent: true
            });

        var genDist = 500;

        // now create the individual particles
        for (var p = 0; p < particleCount; p++) {

          // create a particle with random
          var pX = Math.random() * genDist - genDist / 2,
              pY = Math.random() * genDist - genDist / 2,
              pZ = Math.abs(Math.random() * genDist - genDist / 2),
              particle = new THREE.Vector3(pX, pY, pZ);


          // add it to the geometry
          particles.vertices.push(particle);
        }

        // create the particle system
        var drops = new THREE.Points(
            particles,
            pMaterial);

        rain.add(drops);

        rain.addUpdateCallback( function( obj ){

          var velocity = new THREE.Vector3(0,0,-5)
          drops.geometry.vertices.map(
            function(v)
            {
                v.add(velocity);

              if(v.z <= -100){
                v.z = continuousUniform(100,200);

              }
            }
          );

          drops.geometry.verticesNeedUpdate = true;

        })

        return rain;


    }




}
