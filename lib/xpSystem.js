// XP System Configuration
export const XP_CONFIG = {
  XP_PER_EPISODE: 50,
  BASE_XP_PER_LEVEL: 100, // Level 1->2 requires 100 XP, Level 2->3 requires 200 XP, etc.
};

// Role thresholds based on level
export const ROLE_THRESHOLDS = {
  Bronze: { min: 1, max: 9 },
  Silver: { min: 10, max: 19 },
  Gold: { min: 20, max: 29 },
  Platinum: { min: 30, max: 39 },
  Diamond: { min: 40, max: Infinity },
};

/**
 * Calculate total XP required to reach a specific level
 * Formula: Sum of (level * 100) from 1 to (targetLevel - 1)
 * Example: Level 3 = 100 + 200 = 300 total XP
 */
export function calculateTotalXPForLevel(level) {
  if (level <= 1) return 0;
  // Sum of arithmetic series: n * (n - 1) / 2 * 100
  return ((level - 1) * level / 2) * XP_CONFIG.BASE_XP_PER_LEVEL;
}

/**
 * Calculate XP required for next level
 */
export function calculateXPForNextLevel(currentLevel) {
  return currentLevel * XP_CONFIG.BASE_XP_PER_LEVEL;
}

/**
 * Calculate level based on total XP
 * Using quadratic formula to solve: totalXP = (level - 1) * level / 2 * 100
 */
export function calculateLevelFromXP(totalXP) {
  if (totalXP <= 0) return 1;
  
  // Solve: totalXP = (L - 1) * L / 2 * 100
  // => L^2 - L - (2 * totalXP / 100) = 0
  // Using quadratic formula: L = (1 + sqrt(1 + 8 * totalXP / 100)) / 2
  const level = Math.floor((1 + Math.sqrt(1 + 8 * totalXP / XP_CONFIG.BASE_XP_PER_LEVEL)) / 2);
  return Math.max(1, level);
}

/**
 * Calculate role based on level
 */
export function calculateRole(level) {
  if (level >= ROLE_THRESHOLDS.Diamond.min) return 'Diamond';
  if (level >= ROLE_THRESHOLDS.Platinum.min) return 'Platinum';
  if (level >= ROLE_THRESHOLDS.Gold.min) return 'Gold';
  if (level >= ROLE_THRESHOLDS.Silver.min) return 'Silver';
  return 'Bronze';
}

/**
 * Calculate progress to next level (0-100)
 */
export function calculateLevelProgress(totalXP, currentLevel) {
  const currentLevelXP = calculateTotalXPForLevel(currentLevel);
  const nextLevelXP = calculateTotalXPForLevel(currentLevel + 1);
  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  
  return Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100);
}

/**
 * Add XP to user and recalculate level and role
 */
export function addXPAndRecalculate(user, xpToAdd) {
  const newTotalXP = user.xp + xpToAdd;
  const newLevel = calculateLevelFromXP(newTotalXP);
  const newRole = calculateRole(newLevel);
  
  const leveledUp = newLevel > user.level;
  
  return {
    xp: newTotalXP,
    level: newLevel,
    role: newRole,
    leveledUp,
    xpGained: xpToAdd,
    previousLevel: user.level,
  };
}

/**
 * Get user level statistics
 */
export function getUserLevelStats(user) {
  const currentLevelTotalXP = calculateTotalXPForLevel(user.level);
  const nextLevelTotalXP = calculateTotalXPForLevel(user.level + 1);
  const xpInCurrentLevel = user.xp - currentLevelTotalXP;
  const xpNeededForNextLevel = nextLevelTotalXP - currentLevelTotalXP;
  const progress = calculateLevelProgress(user.xp, user.level);
  
  return {
    currentLevel: user.level,
    currentRole: user.role,
    totalXP: user.xp,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progress,
    nextLevel: user.level + 1,
    nextRole: calculateRole(user.level + 1),
  };
}
