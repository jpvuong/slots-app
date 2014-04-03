module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    less: {
      development: {
        options: {
          paths: 'src',
          yuicompress: true
        },
        files: {
          'build/app.css': 'assets/less/*.less'
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
    }
  });

  grunt.registerTask('default', ['watch']);

};