import AppearTitle from '@src/components/animationComponents/appearTitle/Index';
import LinkText from '@src/components/animationComponents/linkText/Index';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import footerLinks from '@src/components/dom/navbar/constants/footerLinks';
import gsap from 'gsap';
import styles from '@src/components/dom/styles/footer.module.scss';
import useIsMobile from '@src/hooks/useIsMobile';
import { useIsomorphicLayoutEffect } from '@src/hooks/useIsomorphicLayoutEffect';
import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';
import { useWindowSize } from '@darkroom.engineering/hamo';
import Image from 'next/image';

const Time = dynamic(() => import('@src/components/dom/Time'), { ssr: false });

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function Footer() {
  const isMobile = useIsMobile();
  const footerRef = useRef();
  const [isLoading] = useStore(useShallow((state) => [state.isLoading]));
  const windowSize = useWindowSize();

  const START_YEAR = 2025;
  const currentYear = new Date().getFullYear();
  const yearText = currentYear > START_YEAR ? `${START_YEAR} - ${currentYear}` : `${START_YEAR}`;

  useIsomorphicLayoutEffect(() => {
    if (!isLoading) {
      gsap.set(footerRef.current, {
        height: 'auto',
        yPercent: 0,
        transform: 'translate(0%, 0%)'
      });
    }

    return () => {
      const footerTrigger = ScrollTrigger.getById('footerTrigger');
      if (footerTrigger) {
        footerTrigger.kill();
      }
    };
  }, [isLoading, windowSize.height]);

  return (
    <section ref={footerRef} className={clsx(styles.root, 'layout-grid-inner')} role="contentinfo">
      {isMobile ? (
        <div className={styles.mobileColumns} style={{ gridColumn: '1 / 7' }}>
          <div className={styles.companyInfoMobile}>
            <div className={styles.brandName}>
              <Image
                src="/logo-eshade/logo eshade 2 white.svg"
                alt="ESHADE"
                width={180}
                height={55}
                className={styles.brandLogo}
              />
            </div>

            <div className={styles.companyDescription}>
              <p>
                Pusat Alat Fitness Terpercaya di Indonesia. Kami menyediakan alat fitness berkualitas tinggi untuk kebutuhan fitness center atau personal.
              </p>
              <p className={styles.tagline}>
                ESHADE | Mitra Alat Fitness Anda
              </p>
            </div>

            <div className={styles.contactInfo}>
              <p>E-mail: <a href="mailto:globalfitsby@gmail.com">globalfitsby@gmail.com</a></p>
            </div>
          </div>

          <div className={styles.linksContainer}>
            <h6 className={clsx(styles.title, 'h6')}>CUSTOMER SERVICE</h6>
            <p className={styles.waInfoText}>{footerLinks.customerService.onlineUsers}</p>
            <p className={styles.waInfoText}>{footerLinks.customerService.visitors}</p>
            <div className={styles.waList}>
              {footerLinks.customerService.whatsapp.map((wa) => (
                <a key={wa.number} href={wa.href} className={styles.waItem} target="_blank" rel="noopener noreferrer">
                  <div className={styles.waIconBox}><WhatsAppIcon /></div>
                  <span>{wa.number}</span>
                </a>
              ))}
            </div>
          </div>

          <div className={styles.linksContainer}>
            <h6 className={clsx(styles.title, 'h6')}>INFORMATION</h6>
            {footerLinks.information.map((link) => (
              <div key={link.title} className={styles.linkTextContainer}>
                <LinkText className={styles.linkText} title={link.title} href={link.href}>
                  <span className="footer">{link.title}</span>
                </LinkText>
              </div>
            ))}
          </div>

          <div className={styles.linksContainer}>
            <h6 className={clsx(styles.title, 'h6')}>TEMUKAN KAMI</h6>
            <div className={styles.socialIcons}>
              {footerLinks.social.map((link) => (
                <div key={link.title} className={styles.socialIconContainer}>
                  <LinkText target className={styles.socialLink} title={link.title} href={link.href}>
                    <Image
                      src={`/logo/${link.icon}-white.svg`}
                      alt={link.title}
                      width={24}
                      height={24}
                      className={styles.socialIcon}
                    />
                  </LinkText>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Company Info Section */}
          <div className={styles.companyInfo} style={{ gridColumn: '1 / 6' }}>
            <AppearTitle isFooter>
              <div className={styles.brandName}>
                <Image
                  src="/logo-eshade/logo eshade 2 white.svg"
                  alt="ESHADE"
                  width={220}
                  height={70}
                  className={styles.brandLogo}
                />
              </div>
              <div className={styles.companyDescription}>
                <p>
                  Pusat Alat Fitness Terpercaya di Indonesia. Kami menyediakan berbagai pilihan alat fitness berkualitas tinggi, mulai dari produk import eksklusif hingga produk lokal yang kokoh.
                </p>
                <p className={styles.tagline}>
                  ESHADE | Mitra Alat Fitness Anda
                </p>
              </div>
            </AppearTitle>
          </div>

          {/* Customer Service Section */}
          <div className={styles.linksContainer} style={{ gridColumn: '6 / 10' }}>
            <AppearTitle isFooter>
              <h6 className={clsx(styles.title, 'h6')}>CUSTOMER SERVICE</h6>
              <div className={styles.csContent}>
                <p className={styles.waInfoText}>{footerLinks.customerService.onlineUsers}</p>
                <p className={styles.waInfoText}>{footerLinks.customerService.visitors}</p>
                <div className={styles.waList}>
                  {footerLinks.customerService.whatsapp.map((wa) => (
                    <a key={wa.number} href={wa.href} className={styles.waItem} target="_blank" rel="noopener noreferrer">
                      <div className={styles.waIconBox}><WhatsAppIcon /></div>
                      <span>{wa.number}</span>
                    </a>
                  ))}
                </div>
              </div>
            </AppearTitle>
          </div>

          {/* Information Section */}
          <div className={styles.linksContainer} style={{ gridColumn: '10 / 14' }}>
            <AppearTitle isFooter>
              <h6 className={clsx(styles.title, 'h6')}>INFORMATION</h6>
              {footerLinks.information.map((link) => (
                <div key={link.title} className={styles.linkTextContainer}>
                  <LinkText className={styles.linkText} title={link.title} href={link.href}>
                    <span className="footer">{link.title}</span>
                  </LinkText>
                </div>
              ))}
            </AppearTitle>
          </div>

          {/* Temukan Kami Section */}
          <div className={styles.linksContainer} style={{ gridColumn: '14 / 17' }}>
            <AppearTitle isFooter>
              <h6 className={clsx(styles.title, 'h6')}>TEMUKAN KAMI</h6>
              <div className={styles.socialIcons}>
                {footerLinks.social.map((link) => (
                  <div key={link.title} className={styles.socialIconContainer}>
                    <LinkText target className={styles.socialLink} title={link.title} href={link.href}>
                      <Image
                        src={`/logo/${link.icon}-white.svg`}
                        alt={link.title}
                        width={24}
                        height={24}
                        className={styles.socialIcon}
                      />
                    </LinkText>
                  </div>
                ))}
              </div>
            </AppearTitle>
          </div>
        </>
      )}

      {/* Bottom Info */}
      <div className={styles.bottomContainer} style={{ gridColumn: '1 / 17' }}>
        <AppearTitle isFooter>
          <div className={styles.bottomInfo}>
            <div className={clsx('p-x', styles.bottomText)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className={styles.pulseDot} />
              Live Status: Active
            </div>
            <div className={clsx('p-x', styles.bottomText)}>
              Current Time: <Time />
            </div>
            <div className="p-x">© {yearText} · Eshade.id · Mitra Alat Fitness Anda</div>
          </div>
        </AppearTitle>
      </div>
    </section>
  );
}

export default Footer;
