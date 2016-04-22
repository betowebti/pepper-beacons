/**
 * --------------------------------------------------------------------------------------------
 * Factory
 */
angular.module('ngApp.DataFactory', [])

/*
 * Favorites
 */

.factory('favs', function() {
  return {
    items: [],
    loading: true
  };
});

/**
 * --------------------------------------------------------------------------------------------
 * Service
 */

angular.module('ngApp.DataServices', [])

/**
 * Data services
 */

.service('DataService', function($ionicPopup, $q, $cordovaNetwork, ApiService, BeaconService, GeofenceService, DebugService) {

  /**
   * Load favorites
   */

  this.loadFavs = function($scope, resetDatabase, http) {
    if (typeof resetDatabase === 'undefined') resetDatabase = false;
    if (typeof http === 'undefined') http = true;

    if (http) {
      /**
       * Unsubscribe all beacons + geofences
       */

      BeaconService.unsubscribeAll($scope);
      GeofenceService.unsubscribeAll($scope);
    }

    var self = this;

    document.addEventListener("deviceready", function() {
      db.transaction(function(tx) {

        /**
         * Create table if not exists
         */

        if (resetDatabase) {
          tx.executeSql('DROP TABLE IF EXISTS settings');
          tx.executeSql('DROP TABLE IF EXISTS favs');
        }
        tx.executeSql('CREATE TABLE IF NOT EXISTS favs (id integer primary key, name text, icon text, url text, api text, created integer)');

        db.transaction(function(tx) {
          tx.executeSql("SELECT id, name, icon, url, api FROM favs ORDER BY created ASC;", [], function(tx, result) {

            $scope.favs.items.length = 0;

            if (result.rows.length > 0) {
              for (var i = 0; i < result.rows.length; i++) {
                var id = result.rows.item(i).id;
                var api = result.rows.item(i).api;
                var icon = result.rows.item(i).icon;
                var name = result.rows.item(i).name;
                var url = result.rows.item(i).url;

                if (icon == null || $cordovaNetwork.isOffline()) icon = 'img/icons/globe/120.png';

                $scope.$apply(function() {
                  if (url != null) {
                    var fav = {
                      'id': id,
                      'icon': icon,
                      'name': name,
                      'url': url,
                      'api': api
                    };

                    $scope.favs.items.push(fav);
                  }
                });

                if (http && result.rows.item(i).url != null) {

                  /**
                   * Post to Proximity Platform API to get latest notification board changes
                   */

                  var promise = ApiService.handshake($scope, result.rows.item(i).url, result.rows.item(i));

                  promise.then(
                    function(data) { // Request succeeded
                      if (data !== false && data.pass_on !== false) {
                        $scope.api.favorite_notification_boards.push(data);

                        BeaconService.extractFavBeacons($scope);
                        GeofenceService.extractFavGeofences($scope);

                        DebugService.log($scope, 'Fav notification board loaded from remote ↓');
                        DebugService.log($scope, data);

                        db.transaction(function(tx) {
                          tx.executeSql("UPDATE favs SET api = ?, name = ?, icon = ? WHERE id = ?;", [JSON.stringify(data), data.content.name, data.content.icon, data.pass_on.id], function(tx, result) {
                            DebugService.log($scope, 'Api response updated');
                          });
                        });
                      }
                    },
                    function(response) { // Request failed, use offline api data
                      $scope.api.favorite_notification_boards.push(JSON.parse(api));

                      BeaconService.extractFavBeacons($scope);
                      GeofenceService.extractFavGeofences($scope);

                      DebugService.log($scope, 'Fav notification board loaded from local ↓');
                      DebugService.log($scope, JSON.parse(api));
                    }
                  );
                } else {
                  // No http
                  $scope.$apply();
                }
              };
            }

            $scope.safeApply(function() {
              $scope.favs.loading = false;
            });
          });
        });
      });

    }, false);
  }

  /**
   * Add bookmark
   */

  this.addBookmark = function($scope) {
    var self = this;

    var icon = $scope.view.icon;
    if (icon == null) icon = 'img/icons/globe/120.png';
    var now = Date.now();
    var url = (typeof $scope.view.input === 'undefined' || $scope.view.input == '') ? $scope.view.browser : $scope.view.input;

    document.addEventListener("deviceready", function() {
      db.transaction(function(tx) {
        tx.executeSql("SELECT id FROM favs WHERE url = ?;", [url], function(tx, result) {
          if (result.rows.length == 0) {
            db.transaction(function(tx) {
              tx.executeSql("INSERT INTO favs (name, icon, url, api, created) VALUES (?, ?, ?, ?, ?);", [$scope.view.title, icon, url, JSON.stringify($scope.api.active_notification_board), now], function(tx, result) {
                // Reload favorites
                self.loadFavs($scope, false, false);
              });
            });
          }
        });
      });
    }, false);
  }

  /**
   * Delete bookmark
   */

  this.deleteBookmark = function($scope, id) {
    var self = this;

    document.addEventListener("deviceready", function() {
      db.transaction(function(tx) {
        tx.executeSql("DELETE FROM favs WHERE id = ?;", [id], function(tx, result) {

          DebugService.log($scope, 'Bookmark deleted: #' + id);

          // Reload favorites
          self.loadFavs($scope);

          $scope.view.input
            /*
                      $ionicPopup.alert({
                        title: 'Bookmark deleted'
                      }).then(function(res) {
                        DebugService.log($scope, 'Bookmark deleted: #' + id);
                      });
            */
        });
      });
    }, false);
  }

  /**
   * Get setting
   */

  this.getSetting = function(name) {
    var self = this;

    // Create a promise for the db transaction
    var deferred = $q.defer();

    document.addEventListener("deviceready", function() {

      /**
       * Create settings table if not exists
       */

      db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS settings (id integer primary key, name text, value text)');

        db.transaction(function(tx) {
          tx.executeSql("SELECT value FROM settings WHERE name = ?;", [name], function(tx, result) {
            var value = (result.rows.length == 0) ? null : result.rows.item(0).value;
            console.log('get setting ' + name + ': ' + value);
            deferred.resolve(value);
          });
        });
      });

    }, false);

    return deferred.promise;
  }

  /**
   * Set setting
   */

  this.setSetting = function(name, value) {
    var self = this;

    document.addEventListener("deviceready", function() {

      /**
       * Create settings table if not exists
       */

      db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS settings (id integer primary key, name text, value text)');

        db.transaction(function(tx) {
          tx.executeSql("SELECT id FROM settings WHERE name = ?;", [name], function(tx, result) {
            if (result.rows.length == 0) {
              db.transaction(function(tx) {
                tx.executeSql("INSERT INTO settings (name, value) VALUES (?, ?);", [name, value], function(tx, result) {
                  console.log('Setting ' + name + ' inserted with ' + value);
                });
              });
            } else {
              db.transaction(function(tx) {
                tx.executeSql("UPDATE settings SET value = ? WHERE name = ?;", [value, name], function(tx, result) {
                  console.log('Setting ' + name + ' updated to ' + value);
                });
              });
            }
          });
        });
      });

    }, false);
  }
});