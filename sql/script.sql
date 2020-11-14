-- MySQL Script generated by MySQL Workbench
-- Sat Nov  7 12:01:54 2020
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema techSocial
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `techSocial` ;

-- -----------------------------------------------------
-- Schema techSocial
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `techSocial` ;
USE `techSocial` ;

-- -----------------------------------------------------
-- Table `techSocial`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`user` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `user_name` VARCHAR(45) NOT NULL,
  `user_password` VARCHAR(256) NOT NULL,
  `user_mail` VARCHAR(45) NOT NULL,
  `user_img` VARCHAR(256) NULL,
  `user_bio` VARCHAR(180) NULL,
  `user_job` VARCHAR(45) NULL,
  `user_git` VARCHAR(256) NULL,
  `user_linkedin` VARCHAR(256) NULL,
  `user_instagram` VARCHAR(256) NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `user_mail_UNIQUE` (`user_mail` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`group`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`group` (
  `group_id` INT NOT NULL AUTO_INCREMENT,
  `group_name` VARCHAR(90) NOT NULL,
  `group_desc` VARCHAR(256) NOT NULL,
  `group_img` VARCHAR(256) NULL,
  `group_creator_id` INT NULL,
  `group_roles` VARCHAR(45) NULL,
  `group_color` VARCHAR(6) NULL,
  PRIMARY KEY (`group_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`group_membership`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`group_membership` (
  `group_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  INDEX `fk_memb_group_idx` (`group_id` ASC) ,
  INDEX `fk_memb_user_idx` (`user_id` ASC) ,
  PRIMARY KEY (`group_id`, `user_id`),
  CONSTRAINT `fk_memb_group`
    FOREIGN KEY (`group_id`)
    REFERENCES `techSocial`.`group` (`group_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_memb_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `techSocial`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`post`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`post` (
  `post_id` INT NOT NULL,
  `user_id` INT NULL,
  `group_id` INT NULL,
  PRIMARY KEY (`post_id`),
  INDEX `fk_post_group_idx` (`group_id` ASC) ,
  INDEX `fk_post_user_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_post_group`
    FOREIGN KEY (`group_id`)
    REFERENCES `techSocial`.`group` (`group_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_post_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `techSocial`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`comment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`comment` (
  `comment_id` INT NOT NULL,
  `post_id` INT NULL,
  `user_id` INT NULL,
  PRIMARY KEY (`comment_id`),
  INDEX `fk_comment_user_idx` (`user_id` ASC) ,
  INDEX `fk_comment_post_idx` (`post_id` ASC) ,
  CONSTRAINT `fk_comment_post`
    FOREIGN KEY (`post_id`)
    REFERENCES `techSocial`.`post` (`post_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_comment_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `techSocial`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`friend`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`friend` (
  `friend_id` INT NOT NULL,
  `user_id` INT NULL,
  `user2_id` INT NULL,
  `friend_date` DATETIME NULL,
  PRIMARY KEY (`friend_id`),
  INDEX `fk_follower_user_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_follower_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `techSocial`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`notification_type`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`notification_type` (
  `n_type_id` INT NOT NULL,
  `n_type_name` VARCHAR(45) NULL,
  PRIMARY KEY (`n_type_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`notification`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`notification` (
  `notification_id` INT NOT NULL,
  `n_type_id` INT NULL,
  `user_id` INT NULL,
  PRIMARY KEY (`notification_id`),
  INDEX `fk_notification_type_idx` (`n_type_id` ASC) ,
  INDEX `fk_notification_user_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_notification_type`
    FOREIGN KEY (`n_type_id`)
    REFERENCES `techSocial`.`notification_type` (`n_type_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_notification_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `techSocial`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`like`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`like` (
  `user_id` INT NOT NULL,
  `post_id` INT NOT NULL,
  INDEX `fk_like_user_idx` (`user_id` ASC) ,
  INDEX `fk_like_post_idx` (`post_id` ASC) ,
  PRIMARY KEY (`user_id`, `post_id`),
  CONSTRAINT `fk_like_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `techSocial`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_like_post`
    FOREIGN KEY (`post_id`)
    REFERENCES `techSocial`.`post` (`post_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`Event_Category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`Event_Category` (
  `category_id` INT NOT NULL,
  `category_name` VARCHAR(45) NULL,
  PRIMARY KEY (`category_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`event`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`event` (
  `event_id` INT NOT NULL AUTO_INCREMENT,
  `event_name` VARCHAR(45) NOT NULL,
  `event_desc` VARCHAR(90) NOT NULL,
  `event_dateInit` DATETIME NOT NULL,
  `event_img` VARCHAR(256) NULL,
  `category_id` INT NOT NULL,
  `event_dateEnd` DATETIME NULL,
  PRIMARY KEY (`event_id`),
  INDEX `category_id_fk_idx` (`category_id` ASC) ,
  CONSTRAINT `category_id_fk`
    FOREIGN KEY (`category_id`)
    REFERENCES `techSocial`.`Event_Category` (`category_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`event_invitation_list`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`event_invitation_list` (
  `event_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `event_confirm` TINYINT(1) NOT NULL,
  INDEX `fk_eventList_user_idx` (`user_id` ASC) ,
  INDEX `fk_eventList_event_idx` (`event_id` ASC) ,
  PRIMARY KEY (`event_id`, `user_id`),
  CONSTRAINT `fk_eventList_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `techSocial`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_eventList_event`
    FOREIGN KEY (`event_id`)
    REFERENCES `techSocial`.`event` (`event_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`group_list`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`group_list` (
  `group_list_id` INT NOT NULL,
  `group_id` INT NULL,
  `user_id` INT NULL,
  INDEX `fk_eventList_user_idx` (`user_id` ASC) ,
  PRIMARY KEY (`group_list_id`),
  INDEX `fk_groupList_event_idx` (`group_id` ASC) ,
  CONSTRAINT `fk_groupList_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `techSocial`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_groupList_event`
    FOREIGN KEY (`group_id`)
    REFERENCES `techSocial`.`group` (`group_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;



-- -----------------------------------------------------
-- Table `techSocial`.`message`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`message` (
  `message_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  INDEX `fk_message_user_id_idx` (`user_id` ASC) ,
  PRIMARY KEY (`message_id`),
  INDEX `fk_message_room_id_idx` (`room_id` ASC) VISIBLE,
  CONSTRAINT `fk_message_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `techSocial`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_message_room_id`
    FOREIGN KEY (`room_id`)
    REFERENCES `techSocial`.`room` (`room_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`user_message`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`user_message` (
  `message_id` INT NULL,
  `user_id` INT NULL,
  INDEX `fk_umessage_user_id_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_umessage_message_id`
    FOREIGN KEY (`message_id`)
    REFERENCES `techSocial`.`message` (`message_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_umessage_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `techSocial`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `techSocial`.`participants`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `techSocial`.`participants` (
  `participants_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `room_id` INT NOT NULL,
  PRIMARY KEY (`participants_id`),
  INDEX `fk_participants_user_id_idx` (`user_id` ASC) ,
  INDEX `fk_participants_room_id_idx` (`room_id` ASC) ,
  CONSTRAINT `fk_participants_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `techSocial`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_participants_room_id`
    FOREIGN KEY (`room_id`)
    REFERENCES `techSocial`.`room` (`room_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
