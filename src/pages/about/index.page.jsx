/* eslint-disable react/jsx-props-no-spreading */
import CustomHead from '@src/components/dom/CustomHead';
import styles from './styles/about.module.scss';

const seo = {
  title: 'Eshade - About',
  description: 'Mitra Alat Fitness anda. Nikmati kemudahan berbelanja bersama kami.',
  keywords: [
    'Eshade',
    'Alat Fitness',
    'Gym',
    'Peralatan Gym',
    'Fitness Center',
  ],
};

function Page() {
  return (
    <>
      <CustomHead {...seo} />
      <div className={styles.root}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Tentang Kami</h1>
            <p className={styles.subtitle}>Eshade.id - Mitra Alat Fitness anda</p>
          </div>
          
          <div className={styles.content}>
            <p><strong>Selamat datang di www.eshade.id. Nikmati kemudahan berbelanja bersama kami.</strong></p>
            <p>Selamat datang kepada pengunjung website kami.</p>
            <p>Kami dengan senang hati melayani anda dalam memenuhi kebutuhan fitness anda, Baik yang pemula maupun yang sudah punya fitness center. Semua dengan mudah melihat barang, memilih barang, dan menentukan apa yang harus dibeli sendiri tanpa perantara.</p>
            <p>Kami memberikan pilihan untuk menggunakan barang import untuk kelas hotel, apartemen, club house atau untuk fitness center daerah berkelas dengan mengharapkan iuran member yang tinggi, wajib alat fitness import tidak pakai tawar menawar.</p>
            <p>Kami juga memberikan alternatif bagi yang ingin bermain cerdas, dengan dana yang tidak besar anda bisa mendapatkan alat fitness import diramu dengan lokal dengan spare part import, sehingga tetap nampak indah seperti alat fitness import semua, sehingga iuran member masih bisa bagus.</p>
            <p>Tidak lupa kami juga menyediakan produk lokal bagi para pelanggan yang ingin membuka Gym di kelas menengah, dengan produk kelihatan kokoh. Karena segmen inipun masih banyak, seperti yang menilai barbell besi 10 kg lebih berat daripada barbell besi 10 kg besi berlapis karet.</p>
            <p>Kami juga menyediakan assesoris fitness berupa berbagai macam rope, stick, barbell, dumbell, dsb sangat cocok buat mereka yang ingin melengkapi Gym anda maupun untuk koleksi pribadi.</p>
            <p>Tak Lupa kami sediakan spare part baik yang import maupun lokal, untuk kenyamanan dan kelanggengan Gym anda dalam melayani member anda.</p>
            <p>Kami bukan perusahaan besar penyedia alat fitness yang sempurna, namun kami berkomitmen untuk membantu anda dalam hal alat fitness.</p>
            <p>Fitness center atau Gym berkembang pesat akhir2 ini membuat banyak orang berlomba-lomba membuka Gym baru.</p>
            <p>Kondisi demikian membuat para penyedia alat fitness berlomba-lomba mempercantik diri agar menarik untuk dipinang, sehingga membuat para pengusaha atau calon pengusaha Gym bimbang dalam memilih, banyak yang salah memilih untuk jangka panjang, banyak juga salah memilih broker.</p>
            <p>Kami mencoba menerobos agar para pembeli bisa mendapatkan produk yang sesuai keinginan, tahan lama atau awet dipakai, kokoh atau kuat, tepat sasaran dalam pemakaian serta dengan harga yang wajar.</p>
            <p>Dapatkan produk2 kita di toko-toko alat fitness.</p>
            
            <div className={styles.signature}>
              <p><strong>Eshade.id</strong></p>
              <p>Mitra Alat Fitness anda</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Page;
