/* eslint-disable react/jsx-props-no-spreading */
import CustomHead from '@src/components/dom/CustomHead';
import styles from './styles/snk.module.scss';

const seo = {
  title: 'Syarat & Kondisi - Eshade.id',
  description: 'Syarat dan kondisi berbelanja di Eshade.id',
};

function Page() {
  return (
    <>
      <CustomHead {...seo} />
      <div className={styles.root}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>SYARAT DAN KONDISI</h1>
            <p className={styles.subtitle}>Ketentuan Penggunaan Layanan Eshade.id</p>
          </div>
          
          <div className={styles.content}>
            <h2 id="petunjuk-pembelian">Petunjuk Pembelian</h2>
            <ol>
              <li>Pelanggan terlebih dahulu memilih produk yang ingin dipesan dengan meng-klik “Buy Now/ Beli”</li>
              <li>Setelah pesanan masuk ke keranjang belanja, pelanggan dapat memilih untuk menambah pesanan belanja atau Checkout untuk proses selanjutnya</li>
              <li>Dalam proses checkout pelanggan diminta untuk login terlebih dahulu atau membuat registrasi baru.</li>
              <li>Kemudian pelanggan harus mengikuti 3 langkah checkout seperti berikut:
                <ul>
                  <li><strong>Alamat KTP dan Alamat Billing Statement:</strong> Pelanggan diminta untuk mengupdate alamat pengiriman lain jika ada.</li>
                  <li><strong>Payment Method:</strong> Pelanggan diminta untuk Memilih jenis pembayaran.</li>
                  <li><strong>Confirm Order:</strong> Pelanggan diminta untuk menyetujui ketentuan yang berlaku di Eshade.id (setelah proses ini pelanggan akan mendapatkan email tentang informasi pemesanan).</li>
                </ul>
              </li>
              <li>Setelah selesai silahkan hubungi customer service via pesan whatsapp atau yang lain jika pesanan belum di konfirmasi 1x24 jam.</li>
            </ol>

            <h2>Kebijakan Privasi</h2>
            <p>Kami di ESHADE.ID menjaga privasi Anda dengan sangat serius. Kami percaya bahwa privasi elektronik sangat penting bagi keberhasilan berkelanjutan dari Internet.</p>
            <p>Kami percaya bahwa informasi ini hanya dan harus digunakan untuk membantu kami menyediakan layanan yang lebih baik. Itulah sebabnya kami telah menempatkan kebijakan untuk melindungi informasi pribadi Anda.</p>
            <p>Ringkasan Kebijakan kami secara umum, ketika Anda mengunjungi situs web kami dan mengakses informasi Anda akan tetap sebagai anonim. Sebelum kami meminta Anda untuk mengisi informasi, kami akan menjelaskan bagaimana informasi ini akan digunakan. Kami tidak akan memberikan informasi pribadi Anda kepada perusahaan lain atau individu tanpa se-izin Anda.</p>
            <p>Beberapa bagian dari website kami memerlukan pendaftaran untuk mengaksesnya, walaupun biasanya semua yang diminta adalah berupa alamat e-mail dan beberapa informasi dasar tentang Anda.</p>
            <p>Ada bagian di mana kami akan meminta informasi tambahan. Kami melakukan ini untuk dapat lebih memahami kebutuhan Anda, dan memberikan Anda pelayanan yang kami percaya mungkin berharga bagi Anda. Beberapa contoh informasi website kami butuhkan seperti nama, email, alamat rumah, dan info pribadi. Kami memberikan Anda kesempatan untuk memilih untuk tidak menerima materi informasi dari kami.</p>
            <p>Melindungi privasi Anda kami akan mengambil langkah yang tepat untuk melindungi privasi Anda. Setiap kali Anda memberikan informasi yang sensitif (misalnya, nomor kartu kredit untuk melakukan pembelian), kami akan mengambil langkah-langkah yang wajar untuk melindungi, seperti enkripsi nomor kartu Anda. Kami juga akan mengambil langkah-langkah keamanan yang wajar untuk melindungi informasi pribadi Anda dalam penyimpanan. Nomor kartu kredit hanya digunakan untuk proses pembayaran dan bukan disimpan untuk tujuan pemasaran.</p>
            <p>Kami tidak akan memberikan informasi pribadi Anda kepada perusahaan lain atau individu tanpa izin Anda. “Proses Proses order anda kami pastikan aman dengan protokol Secure Sockets Layer (SSL) dimana SSL menyediakan setiap pelanggan keamanan penuh dan kebebasan untuk belanja online tanpa rasa khawatir mengenai kemungkinan pencurian informasi kartu kredit”</p>

            <h2>Penggunaan Cookie</h2>
            <p>Situs ini menggunakan “cookies” untuk mengidentifikasi sesi pengguna pada Website dan dengan demikian menawarkan kontinuitas sebagai anggota bergerak di sekitar lokasi. Cookie hanya digunakan pada Situs untuk menyimpan data yang non-kritis. Cookies adalah potongan informasi yang situs mentransfer ke hard drive komputer Anda untuk tujuan menyimpan catatan.</p>
            <p>Cookie memungkinkan situs web untuk menjaga informasi pengguna di seluruh koneksi. Cookie berupa string kecil berupa karakter yang digunakan oleh banyak situs untuk mengirimkan data ke komputer Anda, dan dalam keadaan tertentu, mengembalikan informasi ke situs web. Cookie hanya berisi informasi bahwa anggota relawan, dan mereka tidak memiliki kemampuan infiltrasi hard drive pengguna dan mencuri informasi pribadi. Fungsi sederhana cookie adalah membantu pengguna menavigasi situs web dengan sebagai obstruksi sesedikit mungkin.</p>
            <p>ESHADE.ID mungkin menggunakan perusahaan iklan luar untuk menampilkan iklan di situs kami. Iklan ini mungkin mengandung cookies, dan tampaknya datang dari situs web, tetapi dalam kenyataannya mereka yang datang dari mitra kami yang melayani iklan di Website. Website tertentu dapat menempatkan “cookie” pada komputer Anda untuk memberikan layanan personalisasi dan / atau mempertahankan identitas Anda di beberapa halaman dalam satu sesi.</p>

            <h2>Keamanan</h2>
            <p>Situs ini memiliki langkah-langkah keamanan untuk melindungi kehilangan, penyalahgunaan dan perubahan informasi di dalam kendali kita. Langkah-langkah ini meliputi metode perlindungan data dasar dan kompleks, dalam penyimpanan offline tertentu informasi dan securitizing server database kami.</p>
            <p>Situs ini memberikan pilihan bagi para customer untuk menghapus informasi mereka dari database kami untuk tidak menerima informasi kedepannya atau untuk tidak lagi menerima layanan kami.</p>
            <p>Sebelum menempatkan pesanan Anda, mohon baca Syarat & ketentuan yang berlaku. Dengan menggunakan situs atau melakukan pembelian, Anda telah menyetujui persyaratan penggunaan (“terms & conditions”) Fitplus Store sebagaimana tercantum di bawah ini dan oleh karenanya terikat dengan syarat penggunaan sehingga Anda harus meninjau kembali setiap anda menggunakan situs ini dan atau melakukan pembelian.</p>

            <h2>Ketepatan</h2>
            <p>Maintenance atau pengawasan telah dilakukan untuk memastikan bahwa produk dan deskripsi konten produk di situs ini adalah akurat. Kami menyatakan bahwa itu adalah benar atau bebas dari kesalahan atau kelalaian dan kami berhak untuk melakukan koreksi yang diperlukan. Apabila ada suatu hal yang meragukan berkaitan dengan produk tersebut Anda harus menanyakan kepada kami secara langsung untuk memastikan keakuratan, harga, warna, ukuran dari produk yang anda pesan dari website kami.</p>

            <h2>Pesanan diterima</h2>
            <p>ESHADE.ID berhak menolak pesanan (order) jika menurut pendapat kami tidak dapat diterima karena suatu dan lain hal yang bertentangan dan atau tidak sesuai prosedur yang ditetapkan.</p>

            <h2>Informasi keamanan</h2>
            <p>Pada saat data yang kami minta, isilah pada tempat yang disediakan dengan baik dan benar, dan kami akan melindungi dengan sertifikat keamanan. Nomor kartu kredit harap diisi dengan benar, data akan disimpan dan dirahasiakan dari publikasi umum. Pesanan anda dienkripsi dan hanya dapat dilihat oleh anggota tim toko online ESHADE.ID</p>

            <h2>Ketersediaan stok</h2>
            <p>ESHADE.ID menyediakan semua item yang dipublikasikan di dalam website. Namun produk dengan periode penjualan terbatas yang ditampilkan di ESHADE.ID sewaktu-waktu dapat ditarik dengan atau tidak dengan pemberitahuan dengan pertimbangan persediaan stok.</p>

            <h2>Standar pengiriman</h2>
            <p>eshade.id akan mengirimkan dan mengkonfirmasi semua pesanan dalam waktu (3-7) hari kerja setelah data yang diterima lengkap dan memproses semua pesanan dalam waktu (1-2) hari kerja sejak diterimanya pesanan. Item/ barang dapat dikirimkan kepada Anda secara individual dan/ atau secara terpisah sesuai keberadaan item/ barang dari lokasi yang berbeda atau langsung dari pemasok ESHADE.ID</p>
            <ul>
              <li>Pengiriman produk akan dilakukan setelah eshade.id melakukan verifikasi via pesan whatsapp, via email atau melalui form konfirmasi atas pembayaran yang dilakukan pelanggan. Pelanggan dapat mengetahui status pemesanan melalui resi pengiriman yang dikirim lewat email atau pesan whatsapp.</li>
              <li>Pengiriman pada hari yang sama, apabila pemesanan produk dan konfirmasi pembayaran dilakukan sebelum pukul 12.00 siang pada jam operasional.</li>
              <li>Biaya pengiriman produk keseluruh Indonesia menggunakan jasa pengiriman dan akan mengacu pada: JNE REG atau EKSPIDISI LOKAL YANG KAMI INFOKAN.</li>
            </ul>

            <h2>Kebijakan Pembayaran</h2>
            <p>Kami memberikan beberapa metode pembayaran:</p>
            <ul>
              <li>Pembayaran dengan Credit Cards : Visa and Mastercard</li>
              <li>Pembayaran dengan Internet Banking.</li>
              <li>Pembayaran dengan Virtual Account</li>
              <li>Pembayaran dengan transfer ke rekekning kami.</li>
            </ul>
            <p>Khusus pembayaran dengan kartu kredit, pelanggan harus meng-klik submit untuk proses pembayaran online dan memasukan data pemegang kartu kredit. Kami tidak bertanggung jawab atas penyalahgunaan kartu kredit atau alat pembayaran apapun yang merupakan hak milik anda dan di luar jangkauan pengawasan kami.</p>
            <p>Pembayaran melalui transfer bank harus melakukan konfirmasi pembayaran dengan memilih salah satu metode:</p>
            <ul>
              <li>Mengisi form konfirmasi yang ada di menu “Konfirmasi Pembayaran”</li>
              <li>Kirim Email dengan di dalam isi mencantumkan Nama, Nomor telpon, Nomor order, Jumlah transfer, bank transfer.</li>
              <li>Mengirim pesan via whatsapp</li>
            </ul>
            <p>Mata uang yang digunakan dan berlaku sah dalam pembelian pada website ini adalah dalam Indonesia Rupiah (IDR). (Semua transaksi akan diproses dalam mata uang Rupiah).</p>
            <p>Semua transaksi akan diproses dalam kurun waktu 1x 24 jam.</p>
            <p>Customer kemudian diwajibkan untuk menyelesaikan pembayaran dan apabila transaksi pembayaran telah berhasil dilakukan, kami akan mengirimkan tanda terima pembayaran melalui surat elektronik (e-mail) kepada alamat e-mail yang tercantum dalam data pribadi pembeli dalam waktu max 1 (satu) hari setelah proses pembayaran selesai dilakukan.</p>

            <h2>Bukti Transaksi (Invoice)</h2>
            <ul>
              <li>Invoice merupakan bukti transaksi yang sah sebagai bukti pemesanan dan pembelian dan sebagai acuan referensi pembelian Anda.</li>
              <li>Anda dihimbau untuk menyimpan invoice dari setiap pembelian anda yang mungkin akan berguna untuk pelayanan setelah pembelian. (Simpan bukti pembayaran bila sewaktu2 diperlukan)</li>
            </ul>

            <h2>Ketentuan pengembalian barang/ return</h2>
            <p>Kami tidak melayani pengembalian barang kecuali apabila ada kesalahan dari pihak kami dan di luar dari yang sudah ditetapkan dalan syarat dan ketentuan pada halaman ini. Pengembalian barang yang terjadi di luar dari kesepakatan penyelesain masalah pembelian yang telah disetujui kedua belah pihak bukan merupakan tanggung jawab dan bagian dari pelayanan kami. Kami tidak bertanggung jawab atas barang yang anda kembalikan karena secara sah barang tersebut sudah menjadi hak milik dan tanggung jawab anda.</p>
            <ul>
              <li>Retur berlaku apabila barang yang diterima dalam keadaan rusak/ cacat/ aksesoris tidak lengkap.</li>
              <li>Refund berlaku apabila barang yang telah di pesan dan dibayar tidak ada stock dan akan kami kembalikan dlam bentuk Kredit Balance.</li>
              <li>Pembatalan Pesanan (cancelation) dibatalkan secara sepihak apabila:
                <ul>
                  <li>Anda belum melakukan pembayaran dalam waktu 3×24 jam setelah order atau atas permintaan pelanggan</li>
                  <li>Kami belum menerima pembayaran anda</li>
                  <li>Tanggal berlaku pada invoice untuk order tersebut sudah kadaluarsa</li>
                </ul>
              </li>
            </ul>
            
            <p><strong>Anda dapat mengembalikan barang kepada kami jika:</strong></p>
            <ul>
              <li>Kerusakan pengiriman atau produksi</li>
              <li>Tidak sesuai pesanan</li>
              <li>Alat Tidak berfungsi</li>
            </ul>
            <p>Alat/ produk pengganti akan dikirim setelah return kami terima. Sebelum pengembalian atau return kami berhak melakukan penelitian atas kerusakan tersebut dan atau melakukan perbaikan. Namun apabila perbaikan tidak dapat dilakukan maka return akan dilakukan atas persetujuan teknisi yang kami tunjuk. Silakan kembalikan item Anda dengan nama Anda, nomor konfirmasi pesanan dan alasan Anda mengembalikan dalam waktu 7 hari dari tanggal pembelian. Sebagai contoh: Jonathan, Nomor pesanan: 0005654, Rusak atau tidak berfungsi dengan baik.</p>

            <h2>Ketentuan Garansi</h2>
            <p>Khusus alat fitnes tertentu (*Hanya untuk produk bergaransi):</p>
            <ol>
              <li>Jaminan kerusakan peralatan fitness/ alat olahraga berlaku karena kelalaian kerja atau desain meliputi: Motor 5 tahun, suku cadang 2 tahun dan kerangka 5 tahun, terhitung dari waktu pengiriman.</li>
              <li>Selama masa garansi berlaku, bebas biaya perbaikan dengan syarat:
                <ul>
                  <li>Menunjukkan kartu garansi yang telah disahkan perusahaan</li>
                  <li>Menunjukkan data pembelian (Bon/ kuitansi/ invoice)</li>
                  <li>Kartu garansi hilang atau cacat, garansi tidak berlaku</li>
                  <li>Aksesoris pelengkap, cat dan baterai tidak termasuk garansi</li>
                </ul>
              </li>
              <li>Garansi juga tidak berlaku untuk kejadian-kejadian berikut:
                <ul>
                  <li>Nomor seri/ invoice tidak cocok atau tidak sesuai dengan kartu garansi</li>
                  <li>Bongkar/ pasang sendiri/ pihak ketiga/ modifikasi peralatan</li>
                  <li>Kesalahan penggunaan alat</li>
                  <li>Bencana alam, kebakaran dan/ atau kebanjiran</li>
                  <li>Perubahan tegangan listrik</li>
                  <li>Kerusakan karena serangan hewan</li>
                  <li>Pengurangan/ penambahan aksesoris lain tanpa sepengetahuan eshade.id</li>
                  <li>Alat fitnes untuk home use (pemakaian pribadi) digunakan untuk umum atau gym</li>
                </ul>
              </li>
            </ol>

            <h2>Pajak barang dan jasa</h2>
            <p>Semua harga sudah termasuk Pajak Barang dan Jasa sesuai aturan yang berlaku dan kami akan mengeluarkan faktur pajak yang sesuai jika diperlukan.</p>

            <h2>Masukan, Saran, dan Pesan</h2>
            <p>Perkembangan dan peningkatan pelayanan kami tidak terlepas dari adanya masukan dari anda. Jika anda ingin memberi masukan, saran, atau pesan, Anda dapat menghubungi customer care kami di globalfitsby@gmail.com atau menghubungi kami di 031-855 15 12 / 082143523123 atau dengan mudah mengisi form pesan kami di halaman customer service.</p>

            <h2>Situs web pihak ketiga</h2>
            <p>Situs eshade.id yang terintegrasi dengan situs lain yang dioperasikan, dikendalikan atau diproduksi oleh pihak ketiga yang memuat atau berisi materi yang tidak disetujui oleh Fitplus Store adalah tanggung jawab situs pihak ketiga.</p>

            <h2>Link ke situs eshade.id</h2>
            <p>Jika Anda ingin membangun link ke website ini, Anda harus terlebih dahulu meminta persetujuan dari eshade.id Untuk meminta persetujuan, Anda dapat menghubungi manajer akun eshade.id. Jika Anda ingin mendapatkan info yang lebih jelas, silakan email tim Promosi/ Manajemen eshade.id. Informasi berikut akan diminta untuk menilai permintaan Anda :</p>
            <ul>
              <li>URL website Anda</li>
              <li>Deskripsi singkat dari situs website Anda</li>
            </ul>
            <p>Kami akan memproses formulir konfirmasi pembayaran pada hari dan waktu operasional kantor ESHADE.ID yaitu Senin-SABTU Pukul; 08.30-17.30.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Page;
