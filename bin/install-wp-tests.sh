#!/usr/bin/env bash

if [ $# -lt 3 ]; then
	echo "usage: $0 <db-name> <db-user> <db-pass> [db-host] [wp-version] [skip-database-creation]"
	exit 1
fi

DB_NAME=$1
DB_USER=$2
DB_PASS=$3
DB_HOST=${4-localhost}
WP_VERSION=${5-latest}
SKIP_DB_CREATE=${6-false}

TMPDIR=${TMPDIR-/tmp}
TMPDIR=$(echo $TMPDIR | sed -e "s/\/$//")
WP_TESTS_DIR=${WP_TESTS_DIR-$TMPDIR/wordpress-tests-lib}
WP_CORE_DIR=${WP_CORE_DIR-$TMPDIR/wordpress/}

download() {
    if [ `which curl` ]; then
        curl -s "$1" > "$2";
    elif [ `which wget` ]; then
        wget -nv -O "$2" "$1"
    fi
}

if [[ $WP_VERSION =~ ^[0-9]+\.[0-9]+\-(beta|RC)[0-9]+$ ]]; then
	WP_BRANCH=${WP_VERSION%\-*}
	WP_TESTS_TAG="branches/$WP_BRANCH"

elif [[ $WP_VERSION =~ ^[0-9]+\.[0-9]+$ ]]; then
	WP_TESTS_TAG="branches/$WP_VERSION"
elif [[ $WP_VERSION =~ [0-9]+\.[0-9]+\.[0-9]+ ]]; then
	if [[ $WP_VERSION =~ [0-9]+\.[0-9]+\.[0] ]]; then
		# version x.x.0 means the first release of the major version, so strip off the .0 and download version x.x
		WP_TESTS_TAG="tags/${WP_VERSION%??}"
	else
		WP_TESTS_TAG="tags/$WP_VERSION"
	fi
elif [[ $WP_VERSION == 'nightly' || $WP_VERSION == 'trunk' ]]; then
	WP_TESTS_TAG="trunk"
else
	# http serves a single offer, whereas https serves multiple. we only want one
	download http://api.wordpress.org/core/version-check/1.7/ /tmp/wp-latest.json
	grep '[0-9]+\.[0-9]+(\.[0-9]+)?' /tmp/wp-latest.json
	LATEST_VERSION=$(grep -o '"version":"[^"]*' /tmp/wp-latest.json | sed 's/"version":"//')
	if [[ -z "$LATEST_VERSION" ]]; then
		echo "Latest WordPress version could not be found"
		exit 1
	fi
	WP_TESTS_TAG="tags/$LATEST_VERSION"
fi
set -ex

install_wp() {
	if [ -d $WP_CORE_DIR ]; then
		return;
	fi

	mkdir -p $WP_CORE_DIR

	if [[ $WP_VERSION == 'nightly' || $WP_VERSION == 'trunk' ]]; then
		mkdir -p $TMPDIR/wordpress-nightly
		download https://wordpress.org/nightly-builds/wordpress-latest.zip  $TMPDIR/wordpress-nightly/wordpress-nightly.zip
		unzip -q $TMPDIR/wordpress-nightly/wordpress-nightly.zip -d $TMPDIR/wordpress-nightly/
		mv $TMPDIR/wordpress-nightly/wordpress/* $WP_CORE_DIR
	else
		if [ $WP_VERSION == 'latest' ]; then
			local ARCHIVE_NAME='latest'
		elif [[ $WP_VERSION =~ [0-9]+\.[0-9]+ ]]; then
			# https serves multiple offers, whereas http serves single.
			download https://api.wordpress.org/core/version-check/1.7/ $TMPDIR/wp-latest.json
			if [[ $WP_VERSION =~ [0-9]+\.[0-9]+\.[0] ]]; then
				# version x.x.0 means the first release of the major version, so strip off the .0 and download version x.x
				LATEST_VERSION=${WP_VERSION%??}
			else
				# otherwise, scan the releases and get the most up to date minor version of the major release
				local VERSION_ESCAPED=`echo $WP_VERSION | sed 's/\./\\\\./g'`
				LATEST_VERSION=$(grep -o '"version":"'$VERSION_ESCAPED'[^"]*' $TMPDIR/wp-latest.json | sed 's/"version":"//' | head -1)
			fi
			if [[ -z "$LATEST_VERSION" ]]; then
				local ARCHIVE_NAME="wordpress-$WP_VERSION"
			else
				local ARCHIVE_NAME="wordpress-$LATEST_VERSION"
			fi
		else
			local ARCHIVE_NAME="wordpress-$WP_VERSION"
		fi
		download https://wordpress.org/${ARCHIVE_NAME}.tar.gz  $TMPDIR/wordpress.tar.gz
		tar --strip-components=1 -zxmf $TMPDIR/wordpress.tar.gz -C $WP_CORE_DIR
	fi

	download https://raw.github.com/markoheijnen/wp-mysqli/master/db.php $WP_CORE_DIR/wp-content/db.php
}

install_test_suite() {
	# portable in-place argument for both GNU sed and Mac OSX sed
	if [[ $(uname -s) == 'Darwin' ]]; then
		local ioption='-i.bak'
	else
		local ioption='-i'
	fi

	# set up testing suite if it doesn't yet exist
	if [ ! -d $WP_TESTS_DIR ]; then
		# set up testing suite
		mkdir -p $WP_TESTS_DIR

		# Determine WordPress version for URL construction
		local WP_VERSION_PATH
		if [[ $WP_TESTS_TAG == trunk ]]; then
			WP_VERSION_PATH="trunk"
		elif [[ $WP_TESTS_TAG == branches/* ]]; then
			WP_VERSION_PATH=${WP_TESTS_TAG#branches/}
		elif [[ $WP_TESTS_TAG == tags/* ]]; then
			WP_VERSION_PATH=${WP_TESTS_TAG#tags/}
		else
			echo "Unknown WordPress test tag: $WP_TESTS_TAG"
			exit 1
		fi

		# Create necessary directories
		mkdir -p "$WP_TESTS_DIR/includes"
		mkdir -p "$WP_TESTS_DIR/data/plugins"
		mkdir -p "$WP_TESTS_DIR/data/themes/default"

		# Download WordPress test files using a more efficient approach
		echo "Downloading WordPress test files from GitHub..."

		# Create necessary directories
		mkdir -p "$WP_TESTS_DIR/includes/phpunit6"
		mkdir -p "$WP_TESTS_DIR/includes/phpunit7"
		mkdir -p "$WP_TESTS_DIR/includes/factory"
		mkdir -p "$WP_TESTS_DIR/includes/rest-api"

		# Download the entire test suite as a zip file
		if [ `which curl` ]; then
			echo "Downloading WordPress test suite..."
			curl -s -L "https://github.com/WordPress/wordpress-develop/archive/$WP_VERSION_PATH.zip" -o "$TMPDIR/wp-tests.zip"
			
			if [ -f "$TMPDIR/wp-tests.zip" ]; then
				echo "Extracting test files..."
				unzip -q "$TMPDIR/wp-tests.zip" "wordpress-develop-$WP_VERSION_PATH/tests/phpunit/includes/*" -d "$TMPDIR"
				
				# Copy all the test files to the test directory
				cp -r "$TMPDIR/wordpress-develop-$WP_VERSION_PATH/tests/phpunit/includes/"* "$WP_TESTS_DIR/includes/"
				
				# Clean up
				rm -rf "$TMPDIR/wordpress-develop-$WP_VERSION_PATH"
				rm -f "$TMPDIR/wp-tests.zip"
			else
				echo "Failed to download WordPress test suite zip file. Falling back to individual file download."
				# Fallback to downloading essential files individually
				for file in bootstrap.php factory.php functions.php testcase.php trac.php utils.php mock-mailer.php install.php unregister-blocks-hooks.php abstract-testcase.php phpunit-adapter-testcase.php; do
					download "https://raw.githubusercontent.com/WordPress/wordpress-develop/$WP_VERSION_PATH/tests/phpunit/includes/$file" "$WP_TESTS_DIR/includes/$file" || echo "Warning: Could not download $file"
				done
				
				# PHPUnit compatibility files
				download "https://raw.githubusercontent.com/WordPress/wordpress-develop/$WP_VERSION_PATH/tests/phpunit/includes/phpunit6/compat.php" "$WP_TESTS_DIR/includes/phpunit6/compat.php" || echo "Warning: Could not download phpunit6/compat.php"
				download "https://raw.githubusercontent.com/WordPress/wordpress-develop/$WP_VERSION_PATH/tests/phpunit/includes/phpunit7/compat.php" "$WP_TESTS_DIR/includes/phpunit7/compat.php" || echo "Warning: Could not download phpunit7/compat.php"
			fi
		else
			# Fallback for systems without curl
			echo "curl not found. Falling back to individual file download."
			for file in bootstrap.php factory.php functions.php testcase.php trac.php utils.php mock-mailer.php install.php unregister-blocks-hooks.php abstract-testcase.php phpunit-adapter-testcase.php; do
				download "https://raw.githubusercontent.com/WordPress/wordpress-develop/$WP_VERSION_PATH/tests/phpunit/includes/$file" "$WP_TESTS_DIR/includes/$file" || echo "Warning: Could not download $file"
			done
			
			# PHPUnit compatibility files
			download "https://raw.githubusercontent.com/WordPress/wordpress-develop/$WP_VERSION_PATH/tests/phpunit/includes/phpunit6/compat.php" "$WP_TESTS_DIR/includes/phpunit6/compat.php" || echo "Warning: Could not download phpunit6/compat.php"
			download "https://raw.githubusercontent.com/WordPress/wordpress-develop/$WP_VERSION_PATH/tests/phpunit/includes/phpunit7/compat.php" "$WP_TESTS_DIR/includes/phpunit7/compat.php" || echo "Warning: Could not download phpunit7/compat.php"
		fi

		# Factory classes
		mkdir -p "$WP_TESTS_DIR/includes/factory"
		for file in class-wp-unittest-factory.php class-wp-unittest-factory-for-attachment.php class-wp-unittest-factory-for-blog.php class-wp-unittest-factory-for-bookmark.php class-wp-unittest-factory-for-comment.php class-wp-unittest-factory-for-network.php class-wp-unittest-factory-for-post.php class-wp-unittest-factory-for-term.php class-wp-unittest-factory-for-thing.php class-wp-unittest-factory-for-user.php class-wp-unittest-factory-callback-after-create.php class-wp-unittest-generator.php; do
			download "https://raw.githubusercontent.com/WordPress/wordpress-develop/$WP_VERSION_PATH/tests/phpunit/includes/factory/$file" "$WP_TESTS_DIR/includes/factory/$file" || echo "Warning: Could not download factory/$file"
		done

		# REST API test files
		mkdir -p "$WP_TESTS_DIR/includes/rest-api"
		for file in class-wp-rest-test-search-handler.php class-wp-test-rest-controller-testcase.php class-wp-test-rest-post-type-controller-testcase.php class-wp-test-rest-testcase.php; do
			download "https://raw.githubusercontent.com/WordPress/wordpress-develop/$WP_VERSION_PATH/tests/phpunit/includes/rest-api/$file" "$WP_TESTS_DIR/includes/rest-api/$file" || echo "Warning: Could not download rest-api/$file"
		done

		# Create a minimal hello.php plugin
		echo "<?php
/**
 * Plugin Name: Hello Dolly
 * Plugin URI: http://wordpress.org/plugins/hello-dolly/
 * Description: This is not just a plugin, it symbolizes the hope and enthusiasm of an entire generation.
 * Author: Matt Mullenweg
 * Version: 1.7.2
 * Author URI: http://ma.tt/
 */
" > "$WP_TESTS_DIR/data/plugins/hello.php"

		# Create minimal theme files
		echo "/*
Theme Name: Default
*/" > "$WP_TESTS_DIR/data/themes/default/style.css"

		echo "<?php
// Silence is golden.
" > "$WP_TESTS_DIR/data/themes/default/index.php"
	fi

	if [ ! -f "$WP_TESTS_DIR/wp-tests-config.php" ]; then
		# Download config file
		download "https://raw.githubusercontent.com/WordPress/wordpress-develop/$WP_VERSION_PATH/wp-tests-config-sample.php" "$WP_TESTS_DIR/wp-tests-config.php"

		# Edit the config file
		# remove all forward slashes in the end
		WP_CORE_DIR=$(echo $WP_CORE_DIR | sed "s:/\+$::")
		sed $ioption "s:dirname( __FILE__ ) . '/src/':'$WP_CORE_DIR/':" "$WP_TESTS_DIR/wp-tests-config.php"
		sed $ioption "s/youremptytestdbnamehere/$DB_NAME/" "$WP_TESTS_DIR/wp-tests-config.php"
		sed $ioption "s/yourusernamehere/$DB_USER/" "$WP_TESTS_DIR/wp-tests-config.php"
		sed $ioption "s/yourpasswordhere/$DB_PASS/" "$WP_TESTS_DIR/wp-tests-config.php"
		sed $ioption "s|localhost|${DB_HOST}|" "$WP_TESTS_DIR/wp-tests-config.php"
	fi
}

install_db() {
	if [ ${SKIP_DB_CREATE} = "true" ]; then
		return 0
	fi

	# parse DB_HOST for port or socket references
	local PARTS=(${DB_HOST//\:/ })
	local DB_HOSTNAME=${PARTS[0]};
	local DB_SOCK_OR_PORT=${PARTS[1]};
	local EXTRA=""

	if ! [ -z $DB_HOSTNAME ] ; then
		if [ $(echo $DB_SOCK_OR_PORT | grep -e '^[0-9]\{1,\}$') ]; then
			EXTRA=" --host=$DB_HOSTNAME --port=$DB_SOCK_OR_PORT --protocol=tcp"
		elif ! [ -z $DB_SOCK_OR_PORT ] ; then
			EXTRA=" --socket=$DB_SOCK_OR_PORT"
		elif ! [ -z $DB_HOSTNAME ] ; then
			EXTRA=" --host=$DB_HOSTNAME --protocol=tcp"
		fi
	fi

	# Check if MySQL is running
	echo "Checking MySQL connection..."
	if ! mysqladmin ping --host=$DB_HOSTNAME --user="$DB_USER" --password="$DB_PASS"$EXTRA -s; then
		echo "Error: Cannot connect to MySQL server. Please check if MySQL is running."
		exit 1
	fi

	# create database (ignore error if it already exists)
	echo "Creating database $DB_NAME..."
	mysqladmin create $DB_NAME --user="$DB_USER" --password="$DB_PASS"$EXTRA || true

	# Verify database was created
	echo "Verifying database $DB_NAME exists..."
	if ! mysql --host=$DB_HOSTNAME --user="$DB_USER" --password="$DB_PASS"$EXTRA -e "USE $DB_NAME"; then
		echo "Error: Database $DB_NAME could not be created or accessed."
		exit 1
	fi

	echo "Database setup completed successfully."
}

install_wp
install_test_suite
install_db
