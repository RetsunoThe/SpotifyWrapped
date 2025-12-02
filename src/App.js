import React, { useEffect, useState } from "react";
import { login, getAccessToken } from "./spotifyAuth";
import { APIController } from "./apiController";
import html2canvas from "html2canvas";
import "./App.css";

let slideCount = 0;


function slideButtonRight() {

    if (slideCount < 2) {
        slideCount += 1;
        updatePos();
    }
}

function slideButtonLeft() {

    if (slideCount > 0) {
        slideCount -= 1;
        updatePos();
    }
}

function updatePos(){

    const slideContainer = document.getElementById('slideContainer');
    const collage2x2 = document.getElementById('collage-2x2');
    const collage3x3 = document.getElementById('collage-3x3');
    const collage4x4 = document.getElementById('collage-4x4');

    if (slideCount === 1) {
        slideContainer.style.transform = `translateX(-18vw)`;
        collage2x2.style = `width: 30vw;
                            transform: translateY(20vh);`;
        collage3x3.style = `width: 40vw;
                            transform: translateY(0vh);`;
        collage4x4.style = `width: 30vw;
                            transform: translateY(20vh);`;

        document.getElementById("collage-toptext").textContent = "3x3 frame";
    }
    if (slideCount === 2) {
        slideContainer.style.transform = `translateX(-63vw)`;
        collage2x2.style = `width: 30vw;
                            transform: translateY(20vh);`;
        collage3x3.style = `width: 30vw;
                            transform: translateY(20vh);`;
        collage4x4.style = `width: 40vw;
                            transform: translateY(0vh);`;

        document.getElementById("collage-toptext").textContent = "4x4 frame";
    }
    if (slideCount === 0) {
        slideContainer.style.transform = `translateX(26vw)`;
        collage2x2.style = `width: 40vw;
                            transform: translateY(0vh);`;
        collage3x3.style = `width: 30vw;
                            transform: translateY(20vh);`;
        collage4x4.style = `width: 30vw;
                            transform: translateY(20vh);`;

        document.getElementById("collage-toptext").textContent = "2x2 frame";
    }
}

//document.getElementById("Box1").textContent = slideCount;


function App() {
  const [token, setToken] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const [activeSection, setActiveSection] = useState("account");

  // Requer html2canvas instalado: npm install html2canvas
const exportarColagem = async (id) => {
  if (id === 0) {
    id = "collage-2x2"
  }
  if (id === 1) {
    id = "collage-3x3"
  }
  if (id === 2) {
    id = "collage-4x4"
  }
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
        <h2 className="logo">TUNECOLLAGE</h2>
        <h1>How's your music taste <br></br>going?</h1>
        <p>Click down below to generate your Spotify bundle.</p>
        <button onClick={login} className="login-button">
          Connect Spotify
        </button>
        <footer>- © {new Date().getFullYear()} TuneCollage -</footer>
      </div>
    );
  }

  // ================= APP PRINCIPAL =================
  return (

    
    <div className="app-container">
      <h1 className="pop-out"> Let's see the results!</h1>
      <div className="pop-in">
        {/* LOGOUT */}
        <div style={{ position: "fixed", top: "15px", right: "15px", zIndex: 9999 }}>
          <button
            onClick={() => {
              localStorage.removeItem("spotify_access_token");
              window.location.href = "/";
            }}
            style={{
              backgroundColor: "#e535b0ff",
              border: "none",
              padding: "10px 18px",
              color: "white",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              fontFamily: "'Josefin Sans', sans-serif"
            }}
          >
            Logout
          </button>
        </div>

        <h1></h1>

        {/* BOTÕES DE NAVEGAÇÃO */}
        <div className="button-group">
          <button onClick={() => setActiveSection("account")} className="toggle-button">
            Top Listened
          </button>

          <button onClick={() => { setActiveSection("collages"); slideCount = 0; }} className="toggle-button">
            Album collage
          </button>

          <button onClick={() => setActiveSection("playlists")} className="toggle-button">
            My Playlists
          </button>
        </div>

        <br></br>
        <br></br>

        {/* ===================================================== */}
        {/* INFORMAÇÕES DA CONTA */}
        {/* ===================================================== */}
        {activeSection === "account" && (
          <section style={{ marginBottom: "30px" }}>
            <h1>Top Listened</h1>

            <br />

            {loadingTracks ? (
              <p></p>
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
      className="play-button listen-button"
    >
      Listen now
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
            <h1 id="collage-toptext">2x2 frame</h1>
            {/* COLAGEM 2x2 */}
            <div className="collage-layout" id="slideContainer">
              <section className="album-collage-section">
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

                  </>
                )}
              </section>

              {/* COLAGEM 3x3 */}
              <section className="album-collage-section">
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
                  </>
                )}
              </section>

              {/* COLAGEM 4x4 */}
              <section className="album-collage-section">
                {loadingTracks ? (
                  <p>Carregando álbuns...</p>
                ) : (
                  <>
                    <div id="collage-4x4" className="collage-grid grid-4x4">
                            {(() => {
                              let images = topTracks.map((t) => t.album?.images?.[0]?.url).filter(Boolean);

                              if (images.length < 16) {
                                const repeat = [...images];
                                while (images.length < 16 && repeat.length > 0) {
                                  images.push(repeat[images.length % repeat.length]);
                                }
                              } else {
                                images = images.slice(0, 16);
                              }

                              return images.map((img, index) => (
                                <img key={index} src={img} alt={`album-${index}`} className="collage-img" />
                              ));
                            })()}
                          </div>
                        </>
                      )}
                    </section>
            </div>

            <div className="button-container">
                <button className="slide-button" onClick={slideButtonLeft}>◀</button>
                <button className="slide-button" onClick={slideButtonRight}>▶</button>
            </div>

            <button onClick={() => exportarColagem(slideCount)} className="download-button">Download this collage</button>

          </>
        )}

        {/* ===================================================== */}
        {/* PLAYLISTS */}
        {/* ===================================================== */}
        {activeSection === "playlists" && (
          <section>
            <h1>My playlists</h1>
            {loadingPlaylists ? (
              <p>Loading playlists</p>
            ) : playlists.length === 0 ? (
              <p>No playlists were found.</p>
            ) : (
              <div
                className="playlist-fade"
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
                        {pl.tracks.total} Songs
                      </p>
                      <a
                        href={pl.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className = "listen-button"
                      >
                        Open in Spotify
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
