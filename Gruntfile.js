module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-imagemin');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    less: {
      development: {
        options: {
          paths: 'src',
          compress: true
        },
        files: {
          'build/app.min.css': 'assets/less/*.less'
        }
      }
    },
    watch: {
      less: {
        files: 'assets/less/*.less',
        tasks: 'less'
      },
      theme_js: {
        files: 'assets/js/*.js',
        tasks: 'uglify'
      },
      imagemin: {
        files: 'assets/images/**/*.{png,jpg,gif}',
        tasks: 'imagemin'
      }
    },
    uglify: {
      theme: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
          beautify: false,
          mangle: true
        },
        files: {
          'build/app.min.js': 'assets/js/*.js'
        }
      }
    },
    imagemin: {
      dynamic: {
        files: [{
          expand: true,
          cwd: 'assets/images/',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'build/images'
        }]
      }
    }
  });

  grunt.registerTask('default', ['watch']);

};