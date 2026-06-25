function initSongs() {
  return {
    songs: [], 
    albums: [],
    searchQuery: '',

    get filteredSongs() {
      if (this.searchQuery === '') {
        return this.songs;
      }
      const query = this.searchQuery.toLowerCase();
      return this.songs.filter(piste => {
        return piste.name.toLowerCase().includes(query) ||
               piste.artists[0].name.toLowerCase().includes(query) ||
               piste.album.name.toLowerCase().includes(query);
      });
    },
    async loadSongs() {
      try {
        const reponse = await fetch('data.json');
        
        if (!reponse.ok) {
          console.error("Impossible de charger le fichier JSON.");
          return;
        }

        this.songs = await reponse.json();
        
        this.genererGraphiqueArtistes();
        this.genererGraphiqueGenres();
        this.extraireAlbumsPopulaires();

      } catch (erreur) {
        console.error(erreur);
      }
    },

    formaterDate(dateString) {
      if (!dateString) return '';
      if (dateString.length === 4) return dateString;
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    },

    extraireAlbumsPopulaires() {
      const mapAlbums = new Map();

      this.songs.forEach(piste => {
        const album = piste.album;
        if (!mapAlbums.has(album.id)) {
          mapAlbums.set(album.id, album);
        }
      });

      this.albums = Array.from(mapAlbums.values())
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 12);
    },

    genererGraphiqueArtistes() {
      const compteurArtistes = {};
      
      this.songs.forEach(piste => {
        piste.artists.forEach(artiste => {
          if (compteurArtistes[artiste.name]) {
            compteurArtistes[artiste.name] += 1;
          } else {
            compteurArtistes[artiste.name] = 1;
          }
        });
      });

      const artistesTries = Object.entries(compteurArtistes)
        .sort((a, b) => b[1] - a[1]) 
        .slice(0, 10); 

      const labels = artistesTries.map(item => item[0]);
      const data = artistesTries.map(item => item[1]);

      const zoneGraphique = document.getElementById('chartArtistes');
      new Chart(zoneGraphique, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: '#9ad0f5'
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            title: {
              display: true,
              text: 'Top 10 des artistes (nombre de morceaux)',
              color: '#666',
              font: { size: 14, weight: 'bold' },
              padding: { bottom: 15 }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Nombre de morceaux',
                color: '#777' 
              },
              beginAtZero: true,
              ticks: { stepSize: 1 },
              grid: { color: '#eaeaea' }
            },
            y: {
              grid: { color: '#eaeaea' }
            }
          }
        }
      });
    },

    genererGraphiqueGenres() {
      const compteurGenres = {};

      this.songs.forEach(piste => {
        if (piste.artists) {
          piste.artists.forEach(artiste => {
            if (artiste.genres && artiste.genres.length > 0) {
              artiste.genres.forEach(genre => {
                if (compteurGenres[genre]) {
                  compteurGenres[genre] += 1;
                } else {
                  compteurGenres[genre] = 1;
                }
              });
            }
          });
        }
      });

      const genresTries = Object.entries(compteurGenres).sort((a, b) => b[1] - a[1]);

      const labels = [];
      const data = [];
      let autresCount = 0;

      genresTries.forEach((item, index) => {
        if (index < 7) {
          labels.push(item[0]);
          data.push(item[1]);
        } else {
          autresCount += item[1];
        }
      });

      if (autresCount > 0) {
        labels.push('Autres');
        data.push(autresCount);
      }

      const zoneGraphique = document.getElementById('chartGenres');
      new Chart(zoneGraphique, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              '#ff8ea3', '#6ebaf5', '#fce17a', '#7dd5c9', 
              '#b69df8', '#ffb86c', '#68d890', '#aeb5b8'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
              labels: { boxWidth: 30 }
            },
            title: {
              display: true,
              text: 'Distribution des genres musicaux',
              color: '#666',
              font: { size: 14, weight: 'bold' },
              padding: { bottom: 15 }
            }
          }
        }
      });
    }
  };
}