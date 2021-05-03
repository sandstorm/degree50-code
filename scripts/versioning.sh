#!/bin/bash

# This script searches for the closest version tag on the current branch
# and outputs it into the ./api/VERSION file if it adheres to SEMVER rules.
# Otherwise a fallback version is written to ./api/VERSION.
# The VERSION file itself is consumed by the VersionProvider from
# https://github.com/shivas/versioning-bundle.
#
# NOTE: If we would not write the fallback version to the file, the provider
# would crash instead!

version="$(git describe --abbrev=0 --always)"

if [[ $version =~ ^[vV]?[0-9]+\.[0-9]+\.[0-9]+(-[-a-zA-Z0-9]+)?$ ]]; then
    echo "Found tag $version"
	echo $version > ./api/VERSION
else
    echo "Found commit hash $version"

	# fallback version, if no tag has been provided
	echo "0.0.0-fallback" > ./api/VERSION
fi
