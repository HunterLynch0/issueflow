package com.lynch.issuetrackerapi.repository;

import com.lynch.issuetrackerapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}
