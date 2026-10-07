import type { APIRoute } from "astro";
import { gourmetReport } from "../data/gourmet-report";
import { scienceTechnologyReport } from "../data/tiktok-science-technology-report";
import { fashionReport } from "../data/tiktok-fashion-report";
import { hobbiesReport } from "../data/tiktok-hobbies-report";
import { sportsReport } from "../data/tiktok-sports-report";
import { vehiclesReport } from "../data/tiktok-vehicles-report";
import { householdReport } from "../data/tiktok-household-report";
import { tourismReport } from "../data/tiktok-tourism-report";
import { educationReport } from "../data/tiktok-education-report";
import { danceReport } from "../data/tiktok-dance-report";
import { featuredContentReport } from "../data/tiktok-featured-content-report";
import { workplaceReport } from "../data/tiktok-workplace-report";
import { localLifeReport } from "../data/tiktok-local-life-report";
import { acgnReport } from "../data/tiktok-acgn-report";
import { scienceFactsReport } from "../data/tiktok-science-facts-report";
import { entertainmentReport } from "../data/tiktok-entertainment-report";
import { relationshipsReport } from "../data/tiktok-relationships-report";
import { cultureReport } from "../data/tiktok-culture-report";
import { healthcareReport } from "../data/tiktok-healthcare-report";
import { parentingReport } from "../data/tiktok-parenting-report";
import { financeReport } from "../data/tiktok-finance-report";
import { musicReport } from "../data/tiktok-music-report";
import { mediaAccountsReport } from "../data/tiktok-media-accounts-report";
import { societyReport } from "../data/tiktok-society-report";
import { renderTikTokLlmsFull } from "../lib/tiktok-llms-full";
import type { TikTokReport } from "../data/tiktok-report-types";
import { idCountryReport } from "../data/tiktok-country-id-report";
import { phCountryReport } from "../data/tiktok-country-ph-report";
import { usCountryReport } from "../data/tiktok-country-us-report";
import { brCountryReport } from "../data/tiktok-country-br-report";
import { mxCountryReport } from "../data/tiktok-country-mx-report";
import { gbCountryReport } from "../data/tiktok-country-gb-report";
import { vnCountryReport } from "../data/tiktok-country-vn-report";
import { myCountryReport } from "../data/tiktok-country-my-report";
import { bdCountryReport } from "../data/tiktok-country-bd-report";
import { pkCountryReport } from "../data/tiktok-country-pk-report";
import { caCountryReport } from "../data/tiktok-country-ca-report";
import { ngCountryReport } from "../data/tiktok-country-ng-report";
import { mmCountryReport } from "../data/tiktok-country-mm-report";
import { zaCountryReport } from "../data/tiktok-country-za-report";
import { auCountryReport } from "../data/tiktok-country-au-report";
import { saCountryReport } from "../data/tiktok-country-sa-report";
import { thCountryReport } from "../data/tiktok-country-th-report";
import { egCountryReport } from "../data/tiktok-country-eg-report";
import { renderTikTokCountryLlmsFull } from "../lib/tiktok-country-llms-full";
import type { TikTokCountryReport } from "../data/tiktok-country-report-types";
import { acgnAnimationAndComicsSubReport } from "../data/tiktok-sub-acgn-animation-and-comics-report";
import { acgnGamesSubReport } from "../data/tiktok-sub-acgn-games-report";
import { cultureReligionSubReport } from "../data/tiktok-sub-culture-religion-report";
import { cultureSeriousLiteratureSubReport } from "../data/tiktok-sub-culture-serious-literature-report";
import { cultureTraditionsAndCultureSubReport } from "../data/tiktok-sub-culture-traditions-and-culture-report";
import { cultureOtherCultureContentSubReport } from "../data/tiktok-sub-culture-other-culture-content-report";
import { danceDanceTrendSubReport } from "../data/tiktok-sub-dance-dance-trend-report";
import { danceDanceTutorialSubReport } from "../data/tiktok-sub-dance-dance-tutorial-report";
import { dancePopDanceSubReport } from "../data/tiktok-sub-dance-pop-dance-report";
import { danceOtherDanceContentSubReport } from "../data/tiktok-sub-dance-other-dance-content-report";
import { danceOtherDanceStyleSubReport } from "../data/tiktok-sub-dance-other-dance-style-report";
import { danceProfessionalDanceSubReport } from "../data/tiktok-sub-dance-professional-dance-report";
import { danceLiveDancePerformanceSubReport } from "../data/tiktok-sub-dance-live-dance-performance-report";
import { educationLanguageLearningSubReport } from "../data/tiktok-sub-education-language-learning-report";
import { educationSchoolEducationSubReport } from "../data/tiktok-sub-education-school-education-report";
import { educationEducationOthersSubReport } from "../data/tiktok-sub-education-education-others-report";
import { educationCampusLifeSubReport } from "../data/tiktok-sub-education-campus-life-report";
import { educationEducationSuppliesSubReport } from "../data/tiktok-sub-education-education-supplies-report";
import { educationOnlineEducationSubReport } from "../data/tiktok-sub-education-online-education-report";
import { educationVocationalLicenseExamsSubReport } from "../data/tiktok-sub-education-vocational-license-exams-report";
import { entertainmentFilmsAndTvsSubReport } from "../data/tiktok-sub-entertainment-films-and-tvs-report";
import { entertainmentCelebrityEntertainmentSubReport } from "../data/tiktok-sub-entertainment-celebrity-entertainment-report";
import { fashionFashionTutorialsSubReport } from "../data/tiktok-sub-fashion-fashion-tutorials-report";
import { fashionFashionProductsSubReport } from "../data/tiktok-sub-fashion-fashion-products-report";
import { fashionFashionNewsSubReport } from "../data/tiktok-sub-fashion-fashion-news-report";
import { featuredContentOthersTiktokAndVideoContentsSubReport } from "../data/tiktok-sub-featured-content-others-tiktok-and-video-contents-report";
import { featuredContentTrendsChallengesSubReport } from "../data/tiktok-sub-featured-content-trends-challenges-report";
import { featuredContentLifeSnapshotsSubReport } from "../data/tiktok-sub-featured-content-life-snapshots-report";
import { featuredContentStoriesPostingCaptionsSubReport } from "../data/tiktok-sub-featured-content-stories-posting-captions-report";
import { featuredContentInternetSubReport } from "../data/tiktok-sub-featured-content-internet-report";
import { featuredContentAudioBgmSubReport } from "../data/tiktok-sub-featured-content-audio-bgm-report";
import { gourmetFoodTutorialsSubReport } from "../data/tiktok-sub-gourmet-food-tutorials-report";
import { gourmetOfflineCateringSubReport } from "../data/tiktok-sub-gourmet-offline-catering-report";
import { gourmetFoodFmcgSubReport } from "../data/tiktok-sub-gourmet-food-fmcg-report";
import { gourmetFoodIngredientsFreshFoodSubReport } from "../data/tiktok-sub-gourmet-food-ingredients-fresh-food-report";
import { gourmetOtherGourmetSubReport } from "../data/tiktok-sub-gourmet-other-gourmet-report";
import { gourmetFoodScienceSubReport } from "../data/tiktok-sub-gourmet-food-science-report";
import { gourmetFoodFestivalsActivitiesSubReport } from "../data/tiktok-sub-gourmet-food-festivals-activities-report";
import { healthcareModernMedicineSubReport } from "../data/tiktok-sub-healthcare-modern-medicine-report";
import { healthcarePanHealthSubReport } from "../data/tiktok-sub-healthcare-pan-health-report";
import { hobbiesGardeningAndPetSubReport } from "../data/tiktok-sub-hobbies-gardening-and-pet-report";
import { hobbiesToysSubReport } from "../data/tiktok-sub-hobbies-toys-report";
import { hobbiesArtRelatedInterestsSubReport } from "../data/tiktok-sub-hobbies-art-related-interests-report";
import { hobbiesVisualRelatedInterestsSubReport } from "../data/tiktok-sub-hobbies-visual-related-interests-report";
import { hobbiesDiySubReport } from "../data/tiktok-sub-hobbies-diy-report";
import { hobbiesOtherHobbiesSubReport } from "../data/tiktok-sub-hobbies-other-hobbies-report";
import { hobbiesBoardAndChessCardGamesSubReport } from "../data/tiktok-sub-hobbies-board-and-chess-card-games-report";
import { hobbiesPerformanceInterestsOperaArtSubReport } from "../data/tiktok-sub-hobbies-performance-interests-opera-art-report";
import { householdHomeLifeSubReport } from "../data/tiktok-sub-household-home-life-report";
import { householdHouseDecorationSubReport } from "../data/tiktok-sub-household-house-decoration-report";
import { householdRealEstateSubReport } from "../data/tiktok-sub-household-real-estate-report";
import { localLifeShoppingSubReport } from "../data/tiktok-sub-local-life-shopping-report";
import { localLifeLeisureAndEntertainmentSubReport } from "../data/tiktok-sub-local-life-leisure-and-entertainment-report";
import { localLifeOfflinePerformanceSubReport } from "../data/tiktok-sub-local-life-offline-performance-report";
import { localLifeLifeServicesSubReport } from "../data/tiktok-sub-local-life-life-services-report";
import { localLifeSportsAndFitnessSubReport } from "../data/tiktok-sub-local-life-sports-and-fitness-report";
import { localLifeGalleriesAndExhibitionsSubReport } from "../data/tiktok-sub-local-life-galleries-and-exhibitions-report";
import { relationshipsPsychologySubReport } from "../data/tiktok-sub-relationships-psychology-report";
import { relationshipsEmotionalPhraseSubReport } from "../data/tiktok-sub-relationships-emotional-phrase-report";
import { relationshipsRelationshipKnowledgeSubReport } from "../data/tiktok-sub-relationships-relationship-knowledge-report";
import { scienceFactsBiologyKnowledgeSubReport } from "../data/tiktok-sub-science-facts-biology-knowledge-report";
import { scienceFactsGeologyKnowledgeSubReport } from "../data/tiktok-sub-science-facts-geology-knowledge-report";
import { scienceFactsAstronomyKnowledgeSubReport } from "../data/tiktok-sub-science-facts-astronomy-knowledge-report";
import { scienceFactsPhysicsKnowledgeSubReport } from "../data/tiktok-sub-science-facts-physics-knowledge-report";
import { scienceFactsUnresolvedMysteriesSubReport } from "../data/tiktok-sub-science-facts-unresolved-mysteries-report";
import { scienceFactsScienceKnowledgeOthersSubReport } from "../data/tiktok-sub-science-facts-science-knowledge-others-report";
import { scienceTechnologySoftwareSubReport } from "../data/tiktok-sub-science-technology-software-report";
import { scienceTechnologyInternetSubReport } from "../data/tiktok-sub-science-technology-internet-report";
import { scienceTechnologyDigitalSubReport } from "../data/tiktok-sub-science-technology-digital-report";
import { scienceTechnologyWebRecourcesDownloadSubReport } from "../data/tiktok-sub-science-technology-web-recources-download-report";
import { scienceTechnologyTechnicalSubReport } from "../data/tiktok-sub-science-technology-technical-report";
import { sportsPhysicalSportsSubReport } from "../data/tiktok-sub-sports-physical-sports-report";
import { sportsFitnessSubReport } from "../data/tiktok-sub-sports-fitness-report";
import { sportsSportsOthersSubReport } from "../data/tiktok-sub-sports-sports-others-report";
import { tourismTourismSitesSubReport } from "../data/tiktok-sub-tourism-tourism-sites-report";
import { tourismTouristGuideSubReport } from "../data/tiktok-sub-tourism-tourist-guide-report";
import { tourismAdministrativeDivisionSubReport } from "../data/tiktok-sub-tourism-administrative-division-report";
import { tourismTourismServiceSubReport } from "../data/tiktok-sub-tourism-tourism-service-report";
import { tourismTouristSuppliesSubReport } from "../data/tiktok-sub-tourism-tourist-supplies-report";
import { tourismTourismRelatedPoliciesSubReport } from "../data/tiktok-sub-tourism-tourism-related-policies-report";
import { vehiclesTransportEquipmentSubReport } from "../data/tiktok-sub-vehicles-transport-equipment-report";
import { vehiclesTrafficServicesSubReport } from "../data/tiktok-sub-vehicles-traffic-services-report";
import { vehiclesTrafficPlaceNamesSubReport } from "../data/tiktok-sub-vehicles-traffic-place-names-report";
import { workplaceSpecialWorkTypesSubReport } from "../data/tiktok-sub-workplace-special-work-types-report";
import { workplaceWorkplaceSkillsSubReport } from "../data/tiktok-sub-workplace-workplace-skills-report";
import { workplaceWorkingIndustryMarketSubReport } from "../data/tiktok-sub-workplace-working-industry-market-report";
import { workplaceOtherWorkplaceSubReport } from "../data/tiktok-sub-workplace-other-workplace-report";
import { workplaceWorkingPoliciesSubReport } from "../data/tiktok-sub-workplace-working-policies-report";
import { workplaceRecruitmentInformationSubReport } from "../data/tiktok-sub-workplace-recruitment-information-report";
import { renderTikTokSubcategoryLlmsFull } from "../lib/tiktok-subcategory-llms-full";
import type { TikTokSubcategoryReport } from "../data/tiktok-subcategory-report-types";
import { youtubeFoodReport } from "../data/youtube-food-report";
import { youtubeLifestyleReport } from "../data/youtube-lifestyle-report";
import { youtubeGamingReport } from "../data/youtube-gaming-report";
import { youtubeMusicReport } from "../data/youtube-music-report";
import { youtubeEntertainmentReport } from "../data/youtube-entertainment-report";
import { youtubeFilmReport } from "../data/youtube-film-report";
import { youtubeTechnologyReport } from "../data/youtube-technology-report";
import { youtubeHealthReport } from "../data/youtube-health-report";
import { youtubeTourismReport } from "../data/youtube-tourism-report";
import { youtubeFashionReport } from "../data/youtube-fashion-report";
import { youtubeSocietyReport } from "../data/youtube-society-report";
import { youtubeKnowledgeReport } from "../data/youtube-knowledge-report";
import { youtubeHobbyReport } from "../data/youtube-hobby-report";
import { youtubeVehiclesReport } from "../data/youtube-vehicles-report";
import { youtubeReligionReport } from "../data/youtube-religion-report";
import { youtubePoliticsReport } from "../data/youtube-politics-report";
import { youtubeSportsReport } from "../data/youtube-sports-report";
import { youtubePetsReport } from "../data/youtube-pets-report";
import { youtubeBusinessReport } from "../data/youtube-business-report";
import { youtubeMilitaryReport } from "../data/youtube-military-report";
import { youtubeHumorReport } from "../data/youtube-humor-report";
import { youtubePerformingArtsReport } from "../data/youtube-performing-arts-report";
import { youtubeTvReport } from "../data/youtube-tv-report";
import { youtubeFitnessReport } from "../data/youtube-fitness-report";
import { youtubeBeautyReport } from "../data/youtube-beauty-report";
import { youtubeSoccerReport } from "../data/youtube-soccer-report";
import { youtubeBasketballReport } from "../data/youtube-basketball-report";
import { youtubeCricketReport } from "../data/youtube-cricket-report";
import { youtubeBaseballReport } from "../data/youtube-baseball-report";
import { youtubeAmericanFootballReport } from "../data/youtube-american-football-report";
import { youtubeIceHockeyReport } from "../data/youtube-ice-hockey-report";
import { youtubeTennisReport } from "../data/youtube-tennis-report";
import { youtubeVolleyballReport } from "../data/youtube-volleyball-report";
import { youtubeGolfReport } from "../data/youtube-golf-report";
import { youtubeBoxingReport } from "../data/youtube-boxing-report";
import { youtubeMmaReport } from "../data/youtube-mma-report";
import { renderYouTubeLlmsFull } from "../lib/youtube-llms-full";
import type { YoutubeNicheReport } from "../data/youtube-report-types";
import { youtubeMusicOfAsiaSubReport } from "../data/youtube-sub-music-of-asia-report";
import { youtubeElectronicMusicSubReport } from "../data/youtube-sub-electronic-music-report";
import { youtubeHipHopMusicSubReport } from "../data/youtube-sub-hip-hop-music-report";
import { youtubeMusicOfLatinAmericaSubReport } from "../data/youtube-sub-music-of-latin-america-report";
import { youtubePopMusicSubReport } from "../data/youtube-sub-pop-music-report";
import { youtubeRockMusicSubReport } from "../data/youtube-sub-rock-music-report";
import { youtubeClassicalMusicSubReport } from "../data/youtube-sub-classical-music-report";
import { youtubeJazzSubReport } from "../data/youtube-sub-jazz-report";
import { youtubeChristianMusicSubReport } from "../data/youtube-sub-christian-music-report";
import { youtubeCountryMusicSubReport } from "../data/youtube-sub-country-music-report";
import { youtubeReggaeSubReport } from "../data/youtube-sub-reggae-report";
import { youtubeSoulMusicSubReport } from "../data/youtube-sub-soul-music-report";
import { youtubeIndependentMusicSubReport } from "../data/youtube-sub-independent-music-report";
import { youtubeActionGameSubReport } from "../data/youtube-sub-action-game-report";
import { youtubeRolePlayingVideoGameSubReport } from "../data/youtube-sub-role-playing-video-game-report";
import { youtubeSportsGameSubReport } from "../data/youtube-sub-sports-game-report";
import { youtubeSimulationVideoGameSubReport } from "../data/youtube-sub-simulation-video-game-report";
import { youtubePuzzleVideoGameSubReport } from "../data/youtube-sub-puzzle-video-game-report";
import { youtubeRacingVideoGameSubReport } from "../data/youtube-sub-racing-video-game-report";
import { youtubeMusicVideoGameSubReport } from "../data/youtube-sub-music-video-game-report";
import { youtubeActionAdventureGameSubReport } from "../data/youtube-sub-action-adventure-game-report";
import { youtubeStrategyVideoGameSubReport } from "../data/youtube-sub-strategy-video-game-report";
import { youtubeCasualGameSubReport } from "../data/youtube-sub-casual-game-report";
import { renderYouTubeSubgenreLlmsFull } from "../lib/youtube-subgenre-llms-full";
import type { YoutubeSubgenreReport } from "../data/youtube-subgenre-report-types";

export const prerender = true;

const TIKTOK_REPORTS: { slug: string; report: TikTokReport }[] = [
  { slug: "gourmet", report: gourmetReport },
  { slug: "science-technology", report: scienceTechnologyReport },
  { slug: "fashion", report: fashionReport },
  { slug: "hobbies", report: hobbiesReport },
  { slug: "sports", report: sportsReport },
  { slug: "vehicles", report: vehiclesReport },
  { slug: "household", report: householdReport },
  { slug: "tourism", report: tourismReport },
  { slug: "education", report: educationReport },
  { slug: "dance", report: danceReport },
  { slug: "featured-content", report: featuredContentReport },
  { slug: "workplace", report: workplaceReport },
  { slug: "local-life", report: localLifeReport },
  { slug: "acgn", report: acgnReport },
  { slug: "science-facts", report: scienceFactsReport },
  { slug: "entertainment", report: entertainmentReport },
  { slug: "relationships", report: relationshipsReport },
  { slug: "culture", report: cultureReport },
  { slug: "healthcare", report: healthcareReport },
  { slug: "parenting", report: parentingReport },
  { slug: "finance", report: financeReport },
  { slug: "music", report: musicReport },
  { slug: "media-accounts", report: mediaAccountsReport },
  { slug: "society", report: societyReport },
];

const TIKTOK_COUNTRY_REPORTS: { slug: string; report: TikTokCountryReport }[] = [
  { slug: "id", report: idCountryReport },
  { slug: "ph", report: phCountryReport },
  { slug: "us", report: usCountryReport },
  { slug: "br", report: brCountryReport },
  { slug: "mx", report: mxCountryReport },
  { slug: "gb", report: gbCountryReport },
  { slug: "vn", report: vnCountryReport },
  { slug: "my", report: myCountryReport },
  { slug: "bd", report: bdCountryReport },
  { slug: "pk", report: pkCountryReport },
  { slug: "ca", report: caCountryReport },
  { slug: "ng", report: ngCountryReport },
  { slug: "mm", report: mmCountryReport },
  { slug: "za", report: zaCountryReport },
  { slug: "au", report: auCountryReport },
  { slug: "sa", report: saCountryReport },
  { slug: "th", report: thCountryReport },
  { slug: "eg", report: egCountryReport },
];

const TIKTOK_SUBCATEGORY_REPORTS: { slug: string; report: TikTokSubcategoryReport }[] = [
  { slug: "acgn-animation-and-comics", report: acgnAnimationAndComicsSubReport },
  { slug: "acgn-games", report: acgnGamesSubReport },
  { slug: "culture-religion", report: cultureReligionSubReport },
  { slug: "culture-serious-literature", report: cultureSeriousLiteratureSubReport },
  { slug: "culture-traditions-and-culture", report: cultureTraditionsAndCultureSubReport },
  { slug: "culture-other-culture-content", report: cultureOtherCultureContentSubReport },
  { slug: "dance-dance-trend", report: danceDanceTrendSubReport },
  { slug: "dance-dance-tutorial", report: danceDanceTutorialSubReport },
  { slug: "dance-pop-dance", report: dancePopDanceSubReport },
  { slug: "dance-other-dance-content", report: danceOtherDanceContentSubReport },
  { slug: "dance-other-dance-style", report: danceOtherDanceStyleSubReport },
  { slug: "dance-professional-dance", report: danceProfessionalDanceSubReport },
  { slug: "dance-live-dance-performance", report: danceLiveDancePerformanceSubReport },
  { slug: "education-language-learning", report: educationLanguageLearningSubReport },
  { slug: "education-school-education", report: educationSchoolEducationSubReport },
  { slug: "education-education-others", report: educationEducationOthersSubReport },
  { slug: "education-campus-life", report: educationCampusLifeSubReport },
  { slug: "education-education-supplies", report: educationEducationSuppliesSubReport },
  { slug: "education-online-education", report: educationOnlineEducationSubReport },
  { slug: "education-vocational-license-exams", report: educationVocationalLicenseExamsSubReport },
  { slug: "entertainment-films-and-tvs", report: entertainmentFilmsAndTvsSubReport },
  { slug: "entertainment-celebrity-entertainment", report: entertainmentCelebrityEntertainmentSubReport },
  { slug: "fashion-fashion-tutorials", report: fashionFashionTutorialsSubReport },
  { slug: "fashion-fashion-products", report: fashionFashionProductsSubReport },
  { slug: "fashion-fashion-news", report: fashionFashionNewsSubReport },
  { slug: "featured-content-others-tiktok-and-video-contents", report: featuredContentOthersTiktokAndVideoContentsSubReport },
  { slug: "featured-content-trends-challenges", report: featuredContentTrendsChallengesSubReport },
  { slug: "featured-content-life-snapshots", report: featuredContentLifeSnapshotsSubReport },
  { slug: "featured-content-stories-posting-captions", report: featuredContentStoriesPostingCaptionsSubReport },
  { slug: "featured-content-internet", report: featuredContentInternetSubReport },
  { slug: "featured-content-audio-bgm", report: featuredContentAudioBgmSubReport },
  { slug: "gourmet-food-tutorials", report: gourmetFoodTutorialsSubReport },
  { slug: "gourmet-offline-catering", report: gourmetOfflineCateringSubReport },
  { slug: "gourmet-food-fmcg", report: gourmetFoodFmcgSubReport },
  { slug: "gourmet-food-ingredients-fresh-food", report: gourmetFoodIngredientsFreshFoodSubReport },
  { slug: "gourmet-other-gourmet", report: gourmetOtherGourmetSubReport },
  { slug: "gourmet-food-science", report: gourmetFoodScienceSubReport },
  { slug: "gourmet-food-festivals-activities", report: gourmetFoodFestivalsActivitiesSubReport },
  { slug: "healthcare-modern-medicine", report: healthcareModernMedicineSubReport },
  { slug: "healthcare-pan-health", report: healthcarePanHealthSubReport },
  { slug: "hobbies-gardening-and-pet", report: hobbiesGardeningAndPetSubReport },
  { slug: "hobbies-toys", report: hobbiesToysSubReport },
  { slug: "hobbies-art-related-interests", report: hobbiesArtRelatedInterestsSubReport },
  { slug: "hobbies-visual-related-interests", report: hobbiesVisualRelatedInterestsSubReport },
  { slug: "hobbies-diy", report: hobbiesDiySubReport },
  { slug: "hobbies-other-hobbies", report: hobbiesOtherHobbiesSubReport },
  { slug: "hobbies-board-and-chess-card-games", report: hobbiesBoardAndChessCardGamesSubReport },
  { slug: "hobbies-performance-interests-opera-art", report: hobbiesPerformanceInterestsOperaArtSubReport },
  { slug: "household-home-life", report: householdHomeLifeSubReport },
  { slug: "household-house-decoration", report: householdHouseDecorationSubReport },
  { slug: "household-real-estate", report: householdRealEstateSubReport },
  { slug: "local-life-shopping", report: localLifeShoppingSubReport },
  { slug: "local-life-leisure-and-entertainment", report: localLifeLeisureAndEntertainmentSubReport },
  { slug: "local-life-offline-performance", report: localLifeOfflinePerformanceSubReport },
  { slug: "local-life-life-services", report: localLifeLifeServicesSubReport },
  { slug: "local-life-sports-and-fitness", report: localLifeSportsAndFitnessSubReport },
  { slug: "local-life-galleries-and-exhibitions", report: localLifeGalleriesAndExhibitionsSubReport },
  { slug: "relationships-psychology", report: relationshipsPsychologySubReport },
  { slug: "relationships-emotional-phrase", report: relationshipsEmotionalPhraseSubReport },
  { slug: "relationships-relationship-knowledge", report: relationshipsRelationshipKnowledgeSubReport },
  { slug: "science-facts-biology-knowledge", report: scienceFactsBiologyKnowledgeSubReport },
  { slug: "science-facts-geology-knowledge", report: scienceFactsGeologyKnowledgeSubReport },
  { slug: "science-facts-astronomy-knowledge", report: scienceFactsAstronomyKnowledgeSubReport },
  { slug: "science-facts-physics-knowledge", report: scienceFactsPhysicsKnowledgeSubReport },
  { slug: "science-facts-unresolved-mysteries", report: scienceFactsUnresolvedMysteriesSubReport },
  { slug: "science-facts-science-knowledge-others", report: scienceFactsScienceKnowledgeOthersSubReport },
  { slug: "science-technology-software", report: scienceTechnologySoftwareSubReport },
  { slug: "science-technology-internet", report: scienceTechnologyInternetSubReport },
  { slug: "science-technology-digital", report: scienceTechnologyDigitalSubReport },
  { slug: "science-technology-web-recources-download", report: scienceTechnologyWebRecourcesDownloadSubReport },
  { slug: "science-technology-technical", report: scienceTechnologyTechnicalSubReport },
  { slug: "sports-physical-sports", report: sportsPhysicalSportsSubReport },
  { slug: "sports-fitness", report: sportsFitnessSubReport },
  { slug: "sports-sports-others", report: sportsSportsOthersSubReport },
  { slug: "tourism-tourism-sites", report: tourismTourismSitesSubReport },
  { slug: "tourism-tourist-guide", report: tourismTouristGuideSubReport },
  { slug: "tourism-administrative-division", report: tourismAdministrativeDivisionSubReport },
  { slug: "tourism-tourism-service", report: tourismTourismServiceSubReport },
  { slug: "tourism-tourist-supplies", report: tourismTouristSuppliesSubReport },
  { slug: "tourism-tourism-related-policies", report: tourismTourismRelatedPoliciesSubReport },
  { slug: "vehicles-transport-equipment", report: vehiclesTransportEquipmentSubReport },
  { slug: "vehicles-traffic-services", report: vehiclesTrafficServicesSubReport },
  { slug: "vehicles-traffic-place-names", report: vehiclesTrafficPlaceNamesSubReport },
  { slug: "workplace-special-work-types", report: workplaceSpecialWorkTypesSubReport },
  { slug: "workplace-workplace-skills", report: workplaceWorkplaceSkillsSubReport },
  { slug: "workplace-working-industry-market", report: workplaceWorkingIndustryMarketSubReport },
  { slug: "workplace-other-workplace", report: workplaceOtherWorkplaceSubReport },
  { slug: "workplace-working-policies", report: workplaceWorkingPoliciesSubReport },
  { slug: "workplace-recruitment-information", report: workplaceRecruitmentInformationSubReport },
];

const YOUTUBE_REPORTS: { slug: string; report: YoutubeNicheReport }[] = [
  { slug: "food", report: youtubeFoodReport },
  { slug: "lifestyle", report: youtubeLifestyleReport },
  { slug: "gaming", report: youtubeGamingReport },
  { slug: "music", report: youtubeMusicReport },
  { slug: "entertainment", report: youtubeEntertainmentReport },
  { slug: "film", report: youtubeFilmReport },
  { slug: "technology", report: youtubeTechnologyReport },
  { slug: "health", report: youtubeHealthReport },
  { slug: "tourism", report: youtubeTourismReport },
  { slug: "fashion", report: youtubeFashionReport },
  { slug: "society", report: youtubeSocietyReport },
  { slug: "knowledge", report: youtubeKnowledgeReport },
  { slug: "hobby", report: youtubeHobbyReport },
  { slug: "vehicles", report: youtubeVehiclesReport },
  { slug: "religion", report: youtubeReligionReport },
  { slug: "politics", report: youtubePoliticsReport },
  { slug: "sports", report: youtubeSportsReport },
  { slug: "pets", report: youtubePetsReport },
  { slug: "business", report: youtubeBusinessReport },
  { slug: "military", report: youtubeMilitaryReport },
  { slug: "humor", report: youtubeHumorReport },
  { slug: "performing-arts", report: youtubePerformingArtsReport },
  { slug: "tv", report: youtubeTvReport },
  { slug: "fitness", report: youtubeFitnessReport },
  { slug: "beauty", report: youtubeBeautyReport },
  { slug: "soccer", report: youtubeSoccerReport },
  { slug: "basketball", report: youtubeBasketballReport },
  { slug: "cricket", report: youtubeCricketReport },
  { slug: "baseball", report: youtubeBaseballReport },
  { slug: "american-football", report: youtubeAmericanFootballReport },
  { slug: "ice-hockey", report: youtubeIceHockeyReport },
  { slug: "tennis", report: youtubeTennisReport },
  { slug: "volleyball", report: youtubeVolleyballReport },
  { slug: "golf", report: youtubeGolfReport },
  { slug: "boxing", report: youtubeBoxingReport },
  { slug: "mma", report: youtubeMmaReport },
];

const YOUTUBE_SUBGENRE_REPORTS: { slug: string; report: YoutubeSubgenreReport }[] = [
  { slug: "music-of-asia", report: youtubeMusicOfAsiaSubReport },
  { slug: "electronic-music", report: youtubeElectronicMusicSubReport },
  { slug: "hip-hop-music", report: youtubeHipHopMusicSubReport },
  { slug: "music-of-latin-america", report: youtubeMusicOfLatinAmericaSubReport },
  { slug: "pop-music", report: youtubePopMusicSubReport },
  { slug: "rock-music", report: youtubeRockMusicSubReport },
  { slug: "classical-music", report: youtubeClassicalMusicSubReport },
  { slug: "jazz", report: youtubeJazzSubReport },
  { slug: "christian-music", report: youtubeChristianMusicSubReport },
  { slug: "country-music", report: youtubeCountryMusicSubReport },
  { slug: "reggae", report: youtubeReggaeSubReport },
  { slug: "soul-music", report: youtubeSoulMusicSubReport },
  { slug: "independent-music", report: youtubeIndependentMusicSubReport },
  { slug: "action-game", report: youtubeActionGameSubReport },
  { slug: "role-playing-video-game", report: youtubeRolePlayingVideoGameSubReport },
  { slug: "sports-game", report: youtubeSportsGameSubReport },
  { slug: "simulation-video-game", report: youtubeSimulationVideoGameSubReport },
  { slug: "puzzle-video-game", report: youtubePuzzleVideoGameSubReport },
  { slug: "racing-video-game", report: youtubeRacingVideoGameSubReport },
  { slug: "music-video-game", report: youtubeMusicVideoGameSubReport },
  { slug: "action-adventure-game", report: youtubeActionAdventureGameSubReport },
  { slug: "strategy-video-game", report: youtubeStrategyVideoGameSubReport },
  { slug: "casual-game", report: youtubeCasualGameSubReport },
];

export const GET: APIRoute = () => {
  const tiktokSections = TIKTOK_REPORTS.map(({ slug, report }) => renderTikTokLlmsFull(report, slug));
  const countrySections = TIKTOK_COUNTRY_REPORTS.map(({ slug, report }) =>
    renderTikTokCountryLlmsFull(report, slug)
  );
  const subcategorySections = TIKTOK_SUBCATEGORY_REPORTS.map(({ slug, report }) =>
    renderTikTokSubcategoryLlmsFull(report, slug)
  );
  const youtubeSections = YOUTUBE_REPORTS.map(({ slug, report }) => renderYouTubeLlmsFull(report, slug));
  const youtubeSubgenreSections = YOUTUBE_SUBGENRE_REPORTS.map(({ slug, report }) =>
    renderYouTubeSubgenreLlmsFull(report, slug)
  );

  const body = `# Vira Trend Reports — llms-full.txt
# Full per-topic/per-channel facts for every TikTok niche (${TIKTOK_REPORTS.length}), TikTok
# country (${TIKTOK_COUNTRY_REPORTS.length}), TikTok subcategory (${TIKTOK_SUBCATEGORY_REPORTS.length}),
# YouTube niche (${YOUTUBE_REPORTS.length}) and YouTube subgenre (${YOUTUBE_SUBGENRE_REPORTS.length}) report
# below. Each also has its own llms-full.txt at
# https://trends.tryvira.app/reports/tiktok/<slug>/llms-full.txt,
# https://trends.tryvira.app/reports/tiktok/country/<slug>/llms-full.txt,
# https://trends.tryvira.app/reports/tiktok/sub/<slug>/llms-full.txt,
# https://trends.tryvira.app/reports/youtube/<slug>/llms-full.txt or
# https://trends.tryvira.app/reports/youtube/sub/<slug>/llms-full.txt with the same content as
# its section here. One source of truth: numbers here match the visible pages and the JSON-LD
# Dataset blocks on each page.

${tiktokSections.join("\n")}
${countrySections.join("\n")}
${subcategorySections.join("\n")}
${youtubeSections.join("\n")}
${youtubeSubgenreSections.join("\n")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
