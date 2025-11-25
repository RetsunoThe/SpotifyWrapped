import React, { useEffect, useState } from "react";
import { login, getAccessToken } from "./spotifyAuth";
import { APIController } from "./apiController";
import html2canvas from "html2canvas";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const [activeSection, setActiveSection] = useState("account");

  // Requer html2canvas instalado: npm install html2canvas
const exportarColagem = async (id) => {
  const elemento = document.getElementById(id);
  if (!elemento) {
    console.warn("Elemento para exportar não encontrado:", id);
    return;
  }

  // 1) pega todas as imagens dentro do elemento e garante crossOrigin + aguarda carregamento
  const imgs = Array.from(elemento.querySelectorAll("img"));

  // se não houver imagens, ainda assim tenta capturar
  try {
    await Promise.all(
      imgs.map((img) => {
        return new Promise((resolve) => {
          // se já tiver crossOrigin definido, ótimo; se não, define
          try { img.crossOrigin = img.crossOrigin || "anonymous"; } catch(e){}

          if (img.complete && img.naturalWidth !== 0) {
            return resolve();
          }
          // em caso de erro, resolve também (para não travar)
          img.onload = () => resolve();
          img.onerror = () => {
            console.warn("Falha no carregamento de imagem (continuando):", img.src);
            resolve();
          };
        });
      })
    );
  } catch (err) {
    console.warn("Erro esperando imagens:", err);
  }

  // 2) captura com html2canvas com opções CORS-friendly
  try {
    const canvas = await html2canvas(elemento, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null, // mantém background visível
      scale: 3,
      logging: false,
      onclone: (clonedDoc) => {
        // remove transform indesejado no clone caso cause problemas (opcional)
        const clonedEl = clonedDoc.getElementById(id);
        if (clonedEl) {
          clonedEl.style.transform = "none";
        }
      },
    });

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${id}.png`;
    link.click();
  } catch (err) {
    console.error("Erro ao gerar imagem com html2canvas:", err);
    alert(
      "Não foi possível gerar a imagem. Possível causa: restrição CORS das imagens (Spotify).\n" +
        "Soluções: usar um servidor proxy CORS ou baixar as imagens para um servidor próprio."
    );
  }
};


  useEffect(() => {
    async function initApp() {
      const t = await getAccessToken();
      if (t) {
        setToken(t);

        setLoadingTracks(true);
        const tracksData = await APIController.getTopTracks(t, 10);
        setTopTracks(tracksData);
        setLoadingTracks(false);

        setLoadingPlaylists(true);
        const playlistsData = await APIController.getUserPlaylists(t);
        setPlaylists(playlistsData);
        setLoadingPlaylists(false);
      }
    }
    initApp();
  }, []);

  // ================= TELA DE LOGIN =================
  if (!token) {
    return (
      <div className="login-screen">
        <h1>Welcome</h1>
        <p>Click here to see your Spotify bundle</p>
        <button onClick={login} className="login-button">
          Connect account
        </button>
        <footer>© {new Date().getFullYear()} Academic project</footer>
      </div>
    );
  }

  // ================= APP PRINCIPAL =================
  return (
    <div className="app-container">

      {/* LOGOUT */}
      <div style={{ position: "fixed", top: "15px", right: "15px", zIndex: 9999 }}>
        <button
          onClick={() => {
            localStorage.removeItem("spotify_access_token");
            window.location.href = "/";
          }}
          style={{
            backgroundColor: "#e53935",
            border: "none",
            padding: "10px 18px",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
          }}
        >
          Logout
        </button>
      </div>

      <h1></h1>

      {/* BOTÕES DE NAVEGAÇÃO */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
        <button onClick={() => setActiveSection("account")} className="toggle-button">
          Most listened
        </button>

        <button onClick={() => setActiveSection("collages")} className="toggle-button">
          Album collage
        </button>

        <button onClick={() => setActiveSection("playlists")} className="toggle-button">
          Minhas Playlists
        </button>
      </div>

      {/* ===================================================== */}
      {/* INFORMAÇÕES DA CONTA */}
      {/* ===================================================== */}
      {activeSection === "account" && (
        <section style={{ marginBottom: "30px" }}>
          <h2></h2>

          <br />

          <h3></h3>

          <h1 className="pop-out">Let's see the results!</h1>

          {loadingTracks ? (
            <p>Loading songs</p>
          ) : (
            topTracks.map((track, index) => (
              <div key={track.id} className="track-card">
                <img
                  src={track.album.images?.[2]?.url}
                  alt={track.name}
                  className="track-image"
                />

                <div className="track-info">

  <p className="track-rank">#{index + 1}</p>

  <p className="track-name">{track.name}</p>

  <p className="track-artist">
    {track.artists.map((a) => a.name).join(", ")}
  </p>

  <p className="track-duration">
    {Math.floor(track.duration_ms / 60000)}:
    {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, "0")}
  </p>

  {/* BOTÃO OUVIR AGORA */}
  <a
    href={track.external_urls.spotify}
    target="_blank"
    rel="noopener noreferrer"
    className="play-button"
  >
    ▶️ Ouvir agora
  </a>
</div>

              </div>
            ))
          )}
        </section>
      )}

      {/* ===================================================== */}
      {/* COLAGENS */}
      {/* ===================================================== */}
      {activeSection === "collages" && (
        <>

          {/* COLAGEM 2x2 */}
          <section className="album-collage-section">
            <h2>🎧 Colagem 2x2 - Álbuns mais escutados</h2>
            {loadingTracks ? (
              <p>Carregando álbuns...</p>
            ) : (
              <>

                <div id="collage-2x2" className="collage-grid grid-2x2">
                  {topTracks.slice(0, 4).map((track) => (
                    <img
                      key={track.id}
                      src={track.album?.images?.[0]?.url}
                      alt={track.name}
                      className="collage-img"
                    />
                  ))}
                </div>

                <button
                  onClick={() => exportarColagem("collage-2x2")}
                  className="download-button"
                >
                  Download collage 2x2
                </button>
              </>
            )}
          </section>

          {/* COLAGEM 3x3 */}
          <section className="album-collage-section">
            <h2>🎵 Colagem 3x3 - Mais tocadas recentemente</h2>
            {loadingTracks ? (
              <p>Carregando álbuns...</p>
            ) : (
              <>
                <div id="collage-3x3" className="collage-grid grid-3x3">
                  {topTracks.slice(0, 9).map((track) => (
                    <img
                      key={track.id}
                      src={track.album?.images?.[0]?.url}
                      alt={track.name}
                      className="collage-img"
                    />
                  ))}
                </div>

                <button
                  onClick={() => exportarColagem("collage-3x3")}
                  className="download-button"
                >
                  📥 Baixar colagem 3x3
                </button>
              </>
            )}
          </section>

        </>
      )}

      {/* ===================================================== */}
      {/* PLAYLISTS */}
      {/* ===================================================== */}
      {activeSection === "playlists" && (
        <section>
          <h2>📀 Minhas Playlists</h2>
          {loadingPlaylists ? (
            <p>Carregando playlists...</p>
          ) : playlists.length === 0 ? (
            <p>Não encontramos playlists.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <img
                    src={pl.images?.[0]?.url || "https://via.placeholder.com/200x200"}
                    alt={pl.name}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ padding: "10px" }}>
                    <h4
                      style={{
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {pl.name}
                    </h4>
                    <p style={{ margin: "5px 0", color: "gray" }}>
                      {pl.tracks.total} músicas
                    </p>
                    <a
                      href={pl.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: "8px",
                        padding: "6px 12px",
                        backgroundColor: "#1DB954",
                        color: "white",
                        borderRadius: "20px",
                        textDecoration: "none",
                      }}
                    >
                      Abrir no Spotify
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
