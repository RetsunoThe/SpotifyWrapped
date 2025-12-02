// src/apiController.js

const apiBaseUrl = "https://api.spotify.com/v1";

export const APIController = (() => {

  // Agora recebe um "limit" opcional
  const _getTopTracks = async (token, limit = 50) => {
    try {
      const result = await fetch(`${apiBaseUrl}/me/top/tracks?limit=${limit}`, {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      });

      if (!result.ok) return [];
      const data = await result.json();
      return data.items || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const _getUserPlaylists = async (token) => {
    try {
      const result = await fetch(`${apiBaseUrl}/me/playlists`, {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      });

      if (!result.ok) return [];
      const data = await result.json();
      return data.items || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const _getGenres = async (token) => {
    try {
      const result = await fetch(`${apiBaseUrl}/browse/categories?locale=sv_US`, {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      });

      if (!result.ok) return [];
      const data = await result.json();
      return data.categories?.items || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const _getPlaylistByGenre = async (token, genreId) => {
    try {
      const result = await fetch(
        `${apiBaseUrl}/browse/categories/${genreId}/playlists?limit=16`,
        { headers: { Authorization: "Bearer " + token } }
      );

      if (!result.ok) return [];
      const data = await result.json();
      return data.playlists?.items || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const _getTracks = async (token, tracksEndPoint) => {
    try {
      const result = await fetch(tracksEndPoint, {
        headers: { Authorization: "Bearer " + token },
      });

      if (!result.ok) return [];
      const data = await result.json();
      return data.items || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const _getTrack = async (token, trackEndPoint) => {
    try {
      const result = await fetch(trackEndPoint, {
        headers: { Authorization: "Bearer " + token },
      });

      if (!result.ok) return null;
      const data = await result.json();
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return {
    getTopTracks: _getTopTracks,
    getUserPlaylists: _getUserPlaylists,
    getGenres: _getGenres,
    getPlaylistByGenre: _getPlaylistByGenre,
    getTracks: _getTracks,
    getTrack: _getTrack,
  };

})();
